import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

// --- Per-horizon server-side cache ---
const cache = new Map<number, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Hathaway (2015) Eq. 8: mean sunspot latitude (exponential drift)
function hathawayLat(tYears: number): number {
  const tMonths = tYears * 12;
  return 28 * Math.exp(-tMonths / 90);
}

const cycleMin25 = 2019.9;
const peakSSN = 140;

// Box-Muller Gaussian sample
function randGauss(mean: number, sigma: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Hathaway (1994) parametric cycle shape
 * R(v) = a * v^3 / [exp(v^2/b^2) - c]
 * where v = months since minimum
 */
function hathawayShape(v: number, a: number, b: number): number {
  if (v <= 0) return 0;
  const c = 0.71;
  const denom = Math.exp((v * v) / (b * b)) - c;
  return (a * Math.pow(v, 3)) / denom;
}

function calculateB(a: number): number {
  // b(a) = 27.12 + 25.15 / (a * 10^3)^1/4
  return 27.12 + 25.15 / Math.pow(a * 1000, 0.25);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const horizon = Math.min(120, Math.max(12, parseInt((req.query.horizon as string) || "60")));

  // Return cached result if fresh
  const hit = cache.get(horizon);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ ...hit.data, fromCache: true });
  }

  try {
    // ── 1. Fetch monthly stats from Supabase ──────────────────────────────
    const pageSize = 1000;
    const diskResults = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        supabase.from("full_disk_images")
          .select("date_obs, num_crops")
          .range(i * pageSize, (i + 1) * pageSize - 1)
      )
    );
    const disks = diskResults.flatMap(r => r.data || []);

    const cropResults = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        supabase.from("sunspot_crops")
          .select("date_obs, lat")
          .range(i * pageSize, (i + 1) * pageSize - 1)
      )
    );
    const crops = cropResults.flatMap(r => r.data || []);

    // ── 2. Build monthlyStats ─────────────────────────────────────────────
    const monthlyMap = new Map<string, { ssn: number; lats: number[] }>();
    disks.forEach((d: any) => {
      if (!d.date_obs) return;
      const dt = new Date(d.date_obs);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key) ?? { ssn: 0, lats: [] };
      entry.ssn += d.num_crops || 0;
      monthlyMap.set(key, entry);
    });
    crops.forEach((c: any) => {
      if (!c.date_obs || c.lat == null) return;
      const dt = new Date(c.date_obs);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.get(key)?.lats.push(c.lat);
    });

    const sortedMonths = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({
        month,
        ssn: v.ssn,
        yearFloat: (() => { const d = new Date(month + "-01"); return d.getFullYear() + d.getMonth() / 12; })(),
      }));

    // ── 3. Build binned butterfly (historical) ────────────────────────────
    const binnedMap = new Map<string, { year: number; lat: number; area: number }>();
    crops.forEach((c: any) => {
      if (!c.date_obs || c.lat == null) return;
      const dt = new Date(c.date_obs);
      const yearFloat = dt.getFullYear() + (dt.getMonth()) / 12 + dt.getDate() / 365;
      
      // DOWNSAMPLING: Bin by 0.25 years (3 months) and 4 degrees latitude strictly for UI performance
      const bYear = (Math.round(yearFloat * 4) / 4).toFixed(2);
      const bLat  = (Math.round(c.lat / 4) * 4).toFixed(1);
      const key = `${bYear}_${bLat}`;
      
      if (!binnedMap.has(key))
        binnedMap.set(key, { year: parseFloat(bYear), lat: parseFloat(bLat), area: 30 }); // Slightly larger area points to compensate fewer density
      else {
        const existing = binnedMap.get(key)!;
        existing.area = Math.min(100, existing.area + 10);
      }
    });
    const historicalButterflyAll = Array.from(binnedMap.values());

    // ── 4. Kalman Filter Initialization ─────────────────────────────────
    const ALPHA_W = 0.2; // Process noise coeff
    const ALPHA_V = 2.5; // Measurement noise coeff
    
    // Last observed 13-month smoothed data is our starting point
    // For simplicity, we use the last available sorted month
    const startMonthIdx = sortedMonths.length - 1;
    const startSsn = sortedMonths[startMonthIdx]?.ssn || 0;
    
    // Months since Cycle 25 minimum
    const cyc25StartMonth = Math.round((cycleMin25 - (sortedMonths[0]?.yearFloat || cycleMin25)) * 12);
    const monthsSinceMinOffset = Math.max(1, startMonthIdx - cyc25StartMonth);

    // Estimate 'a' for Cycle 25 from observed peak
    // Peak condition: dR/dv = 0, usually v_peak approx 3.5-4.5 yrs (~48 months)
    // We calibrate 'a' such that max(R) = peakSSN
    let a_param = 0.01; // Initial guess
    let b_param = calculateB(a_param);
    // Rough calibration loop to find 'a' that matches observed peakSSN
    for(let iter=0; iter<10; iter++) {
        const r_peak = hathawayShape(50, a_param, b_param);
        a_param *= (peakSSN / Math.max(1, r_peak));
        b_param = calculateB(a_param);
    }

    // --- KALMAN FILTER LOOP (Last 6 months correction) ---
    let stateR = startSsn;
    let stateP = 10.0; // Initial error covariance

    // Stabilize with last 6 months of data
    const last6 = sortedMonths.slice(-6);
    last6.forEach((obs, i) => {
        const v = monthsSinceMinOffset - (5 - i);
        if (v <= 1) return;
        
        // 1. Predict
        const phi = hathawayShape(v, a_param, b_param) / hathawayShape(v - 1, a_param, b_param);
        stateR = phi * stateR;
        stateP = phi * phi * stateP + ALPHA_W * stateR;
        
        // 2. Update
        const K = stateP / (stateP + ALPHA_V * stateR);
        stateR = stateR + K * (obs.ssn - stateR);
        stateP = (1 - K) * stateP;
    });

    // ── 5. Build forecast months ──────────────────────────────────────────
    const lastMonth = sortedMonths[sortedMonths.length - 1] || { month: "2024-01", yearFloat: 2024.0, ssn: 0 };
    const lastDate  = new Date(lastMonth.month + "-01");

    const historyPredictions = sortedMonths.map(d => ({
      month: d.month,
      yearFloat: d.yearFloat,
      actualSsn: d.ssn,
      historySsn: d.ssn,
      isForecast: false,
    }));

    const forecastPredictions: any[] = [];
    const syntheticButterfly: any[] = [];

    // Current state for extrapolation
    let currentR = stateR;
    let currentP = stateP;

    for (let i = 0; i < horizon; i++) {
      const nd = new Date(lastDate);
      nd.setMonth(lastDate.getMonth() + i + 1);
      const mStr = nd.toISOString().slice(0, 7);
      const yf   = nd.getFullYear() + nd.getMonth() / 12;
      const v    = monthsSinceMinOffset + i + 1;

      // Kalman extrapolation
      const phi = hathawayShape(v, a_param, b_param) / hathawayShape(v - 1, a_param, b_param);
      currentR = phi * currentR;
      currentP = phi * phi * currentP + ALPHA_W * currentR;
      
      const resR = Math.max(0, currentR);
      
      forecastPredictions.push({ 
        month: mStr, 
        yearFloat: yf, 
        hathawaySSN: resR, 
        isForecast: true 
      });

      // Butterfly scatter: frequency proportional to predicted SSN
      // Spörers Law (exponential) from Eq 8 Hathaway 2015
      const tl  = (yf - cycleMin25);
      const lat = hathawayLat(tl);
      
      // Points per hemisphere: scale with predicted number, heavily throttled
      const n = Math.min(3, Math.max(1, Math.round(resR / 45)));
      for (let s = 0; s < n; s++) {
        const area = 15 + Math.random() * 20;
        syntheticButterfly.push({ year: yf, lat: randGauss(+lat, 5.5), area, isPredicted: true });
        syntheticButterfly.push({ year: yf, lat: randGauss(-lat, 5.5), area, isPredicted: true });
      }
    }

    const allPredictions = [...historyPredictions, ...forecastPredictions];
    const predMinYear = allPredictions[0]?.yearFloat ?? 0;
    const predMaxYear = allPredictions[allPredictions.length - 1]?.yearFloat ?? 1;

    // Filter historical butterfly to domain
    const historicalButterfly = historicalButterflyAll.filter(
      p => p.year >= predMinYear && p.year <= predMaxYear
    );

    // ── 6. Density cache for solar disk viewer (forecast months only) ─────
    // Indexed by forecastPredictions index for O(1) lookup on client
    const DENSITY_WINDOW_MONTHS = 3;
    const allSpots = [...historicalButterfly, ...syntheticButterfly];

    // Group spots by yearFloat rounded to 0.1 for fast lookup
    const spotByBin = new Map<number, number[]>();
    allSpots.forEach(p => {
      const bin = Math.round(p.year * 10); // tenths of year
      const arr = spotByBin.get(bin) ?? [];
      arr.push(p.lat);
      spotByBin.set(bin, arr);
    });

    const densityCache: Record<number, { lat: number; freq: number }[]> = {};
    forecastPredictions.forEach((pred, fi) => {
      const pIdx = historyPredictions.length + fi;
      const windowBins: number[] = [];
      for (let db = -DENSITY_WINDOW_MONTHS * 10; db <= DENSITY_WINDOW_MONTHS * 10; db++) {
        windowBins.push(Math.round(pred.yearFloat * 10) + db);
      }
      const lats: number[] = [];
      windowBins.forEach(b => spotByBin.get(b)?.forEach(l => lats.push(l)));

      const densityMap: { lat: number; freq: number }[] = [];
      for (let l = -50; l <= 50; l++) {
        const freq = lats.filter(v => Math.abs(v - l) < 0.5).length;
        if (freq > 0) densityMap.push({ lat: l, freq });
      }
      densityCache[pIdx] = densityMap;
    });

    const result = {
      predictions: allPredictions,
      butterflyHistorical: historicalButterfly,
      butterflyForecast: syntheticButterfly,
      densityCache,
      forecastStartIndex: historyPredictions.length,
      xDomain: [predMinYear, predMaxYear] as [number, number],
    };

    cache.set(horizon, { data: result, ts: Date.now() });
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    return res.status(200).json({ ...result, fromCache: false });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
