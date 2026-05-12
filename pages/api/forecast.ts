import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";
import { Matrix, SingularValueDecomposition } from "ml-matrix";

// --- Per-horizon server-side cache ---
const cache = new Map<number, { data: any; ts: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Podladchikova & Van der Linden (2012): mean sunspot latitude (exponential drift)
function pvlLat(tYears: number): number {
  const tMonths = tYears * 12;
  return 28 * Math.exp(-tMonths / 90);
}

const cycleMin25 = 2019.9;
const peakSSN = 140;

/**
 * Podladchikova & Van der Linden (2012) parametric cycle shape
 * R(v) = a * v^3 / [exp(v^2/b^2) - c]
 * where v = months since minimum
 */
function pvlShape(v: number, a: number, b: number): number {
  if (v <= 0) return 0;
  const c = 0.71;
  const denom = Math.exp((v * v) / (b * b)) - c;
  return (a * Math.pow(v, 3)) / denom;
}

function calculateB(a: number): number {
  return 27.12 + 25.15 / Math.pow(a * 1000, 0.25);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const horizon = Math.min(120, Math.max(12, parseInt((req.query.horizon as string) || "60")));

  const hit = cache.get(horizon);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return res.status(200).json({ ...hit.data, fromCache: true });
  }

  try {
    // ── 1. Fetch Data ─────────────────────────────────────────────────────
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

    // ── 2. Process Monthly SSN and DMD Mesh ───────────────────────────────
    const monthlyMap = new Map<string, { ssn: number; monthsSince2010: number }>();
    const latBins = 25; // Align with 4-degree visualization grid (100 / 4)
    const binSize = 4;
    
    // Group everything by month (YYYY-MM)
    disks.forEach((d: any) => {
      if (!d.date_obs) return;
      const dt = new Date(d.date_obs);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key) ?? { ssn: 0, monthsSince2010: 0 };
      entry.ssn += d.num_crops || 0;
      monthlyMap.set(key, entry);
    });

    const sortedMonthKeys = Array.from(monthlyMap.keys()).sort();
    const historyMonthsCount = sortedMonthKeys.length;
    
    // Snapshots: [latBin][monthIdx]
    const snapshots = Array.from({ length: latBins }, () => new Array(historyMonthsCount).fill(0));
    
    crops.forEach((c: any) => {
      if (!c.date_obs || c.lat == null) return;
      const dt = new Date(c.date_obs);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      const mIdx = sortedMonthKeys.indexOf(key);
      if (mIdx !== -1) {
        // Precise alignment with 4-degree grid used in binnedMap
        const binIdx = Math.round(c.lat / 4) + 12; // -48° is index 0, 0° is index 12, 48° is index 24
        if (binIdx >= 0 && binIdx < latBins) {
          snapshots[binIdx][mIdx] += 1;
        }
      }
    });

    const sortedMonths = sortedMonthKeys.map(key => {
      const d = monthlyMap.get(key)!;
      const [y, m] = key.split("-").map(Number);
      return {
        month: key,
        ssn: d.ssn,
        yearFloat: y + (m - 1) / 12
      };
    });

    // ── 3. Build binned butterfly (historical) for UI ──────────────────────
    const binnedMap = new Map<string, { year: number; lat: number; ssn: number }>();
    crops.forEach((c: any) => {
      if (!c.date_obs || c.lat == null) return;
      const dt = new Date(c.date_obs);
      const yearFloat = dt.getFullYear() + (dt.getMonth()) / 12 + dt.getDate() / 365;
      const bYear = (Math.round(yearFloat * 4) / 4).toFixed(2);
      const bLat  = (Math.round(c.lat / 4) * 4).toFixed(1);
      const key = `${bYear}_${bLat}`;
      if (!binnedMap.has(key))
        binnedMap.set(key, { year: parseFloat(bYear), lat: parseFloat(bLat), ssn: 30 });
      else {
        const existing = binnedMap.get(key)!;
        existing.ssn = Math.min(100, existing.ssn + 10);
      }
    });
    const historicalButterflyAll = Array.from(binnedMap.values());

    // ── 4. Kalman Filter ──────────────────────────────────────────────────
    const ALPHA_W = 0.2; 
    const ALPHA_V = 2.5; 
    const cycleMin24 = 2008.9;
    const getMonthsSinceMin = (yearFloat: number) => {
      const start = yearFloat >= cycleMin25 ? cycleMin25 : cycleMin24;
      return Math.max(1, Math.round((yearFloat - start) * 12));
    };

    let a_param = 0.01; 
    let b_param = calculateB(a_param);
    for(let iter=0; iter<10; iter++) {
        const r_peak = pvlShape(50, a_param, b_param);
        a_param = a_param * (peakSSN / Math.max(1, r_peak));
        b_param = calculateB(a_param);
    }

    let stateR = sortedMonths[0]?.ssn || 0;
    let stateP = 10.0; 
    const historyPredictions = sortedMonths.map((d) => {
      const v = getMonthsSinceMin(d.yearFloat);
      const prevV = getMonthsSinceMin(d.yearFloat - 1/12);
      const phi = pvlShape(v, a_param, b_param) / Math.max(0.1, pvlShape(prevV, a_param, b_param));
      stateP = phi * phi * stateP + ALPHA_W * stateR;
      const K = stateP / (stateP + ALPHA_V * stateR);
      stateR = stateR + K * (d.ssn - stateR);
      stateP = (1 - K) * stateP;
      return { ...d, kalmanSSN_history: stateR };
    });

    // ── 5. Forecast ───────────────────────────────────────────────────────
    const forecastPredictions: any[] = [];
    const syntheticButterfly: any[] = [];
    let currentR = stateR;
    let currentP = stateP;

    for (let i = 1; i <= horizon; i++) {
      const lastMonth = sortedMonths[sortedMonths.length - 1];
      const nd = new Date(lastMonth.month + "-01");
      nd.setMonth(nd.getMonth() + i);
      const yf = nd.getFullYear() + nd.getMonth() / 12;
      const v = getMonthsSinceMin(yf);
      const prevV = getMonthsSinceMin(yf - 1/12);
      const phi = pvlShape(v, a_param, b_param) / Math.max(0.1, pvlShape(prevV, a_param, b_param));
      currentR = phi * currentR;
      currentP = phi * phi * currentP + ALPHA_W * currentR;
      const resR = Math.max(0, currentR);
      forecastPredictions.push({
        month: `${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,"0")}`,
        yearFloat: yf,
        kalmanSSN_forecast: resR,
        isForecast: true 
      });

      const lat = pvlLat(yf - cycleMin25);
      const n = Math.min(3, Math.max(1, Math.round(resR / 45)));
      for (let s = 0; s < n; s++) {
        syntheticButterfly.push({
          year: yf + Math.random() * 0.05,
          lat: lat + (Math.random() - 0.5) * 15,
          ssn: 15 + Math.random() * 20
        });
      }
    }

    const allPredictions = [...historyPredictions, ...forecastPredictions];
    const historicalButterfly = historicalButterflyAll.filter(
      p => p.year >= allPredictions[0].yearFloat && p.year <= allPredictions[allPredictions.length-1].yearFloat
    );

    // ── 6. Experimental DMD Spörer (Latitudinal Migration) ────────────────
    const dmdButterflyAdjustment: any[] = [];
    const dmdButterflyForecast: any[] = [];
    const adjustmentIntegrals: Record<number, number> = {};
    const forecastIntegrals: number[] = [];
    let ssnScaleK = 1.0; 

    if (historyMonthsCount > 10) {
      try {
        const X1 = new Matrix(snapshots.map(row => row.slice(0, -1)));
        const X2 = new Matrix(snapshots.map(row => row.slice(1)));

        // Optimized DMD: Use Truncated SVD to capture physical modes and ignore noise
        const svd = new SingularValueDecomposition(X1);
        const U = svd.leftSingularVectors;
        const V = svd.rightSingularVectors;
        const s = svd.diagonal;
        
        const k = Math.min(10, s.length);
        const Sk = Matrix.zeros(k, k);
        for (let i = 0; i < k; i++) Sk.set(i, i, 1 / s[i]);
        
        const Uk = U.subMatrix(0, U.rows - 1, 0, k - 1);
        const Vk = V.subMatrix(0, V.rows - 1, 0, k - 1);
        
        const X1_pinv = Vk.mmul(Sk).mmul(Uk.transpose());
        const A = X2.mmul(X1_pinv);
        
        // Adjustment (Integral calculation)
        let totalHistSSN = 0;
        let totalHistIntegral = 0;

        for (let t = 0; t < historyMonthsCount; t++) {
          let sum = 0;
          if (t > 0) {
            const prevV = new Matrix([snapshots.map(row => row[t-1])]).transpose();
            const predV = A.mmul(prevV);
            for (let b = 0; b < latBins; b++) {
              const val = predV.get(b, 0);
              sum += Math.max(0, val);
              const histVal = snapshots[b][t];
              if (t % 3 === 0 && val > 0.1 && histVal > 0) {
                dmdButterflyAdjustment.push({
                  year: sortedMonths[t].yearFloat,
                  lat: (b - 12) * 4, 
                  ssn: Math.min(100, 15 + val * 20) 
                });
              }
            }
          } else {
            sum = snapshots.reduce((acc, row) => acc + row[0], 0);
          }
          adjustmentIntegrals[t] = sum;
          totalHistSSN += sortedMonths[t].ssn || 0;
          totalHistIntegral += sum;
        }

        // Auto-scaling factor to match SSN magnitude
        ssnScaleK = totalHistIntegral > 0 ? (totalHistSSN / totalHistIntegral) : 1.0;

        // Forecast (Integral calculation)
        let currentV = new Matrix([snapshots.map(row => row[historyMonthsCount - 1])]).transpose();
        forecastPredictions.forEach((p, i) => {
          currentV = A.mmul(currentV).mul(0.98); 
          let sum = 0;
          for (let b = 0; b < latBins; b++) {
            const val = currentV.get(b, 0);
            sum += Math.max(0, val);
            if (i % 3 === 0 && val > 0.4) { 
              dmdButterflyForecast.push({
                year: p.yearFloat,
                lat: (b - 12) * 4, 
                ssn: Math.min(100, 20 + val * 25)
              });
            }
          }
          forecastIntegrals.push(sum * ssnScaleK);
        });

        // Scale adjustment integrals
        for (let t in adjustmentIntegrals) {
          adjustmentIntegrals[t] *= ssnScaleK;
        }
      } catch (e) {
        console.error("DMD Spörer Error:", e);
      }
    }

    // ── 7. Experimental DMD 1D (SSN) ──────────────────────────────────────
    const dmdHistory: number[] = sortedMonths.map(m => m.ssn);
    let dmdLambda = 1.0;
    if (dmdHistory.length > 5) {
      let numerator = 0;
      let denominator = 0;
      for (let t = 0; t < dmdHistory.length - 1; t++) {
        numerator += dmdHistory[t] * dmdHistory[t + 1];
        denominator += dmdHistory[t] * dmdHistory[t];
      }
      dmdLambda = denominator > 0 ? numerator / denominator : 1.0;
      dmdLambda = Math.min(1.05, Math.max(0.9, dmdLambda)); 
    }

    const finalPredictions = allPredictions.map((p, i) => {
      const fIdx = i - sortedMonths.length;
      const valHistory = !p.isForecast ? (adjustmentIntegrals[i] || 0) : null;
      const valForecast = p.isForecast ? (forecastIntegrals[fIdx] || 0) : null;
      
      return {
        ...p,
        historySsn: p.ssn,
        dmdSSN_history: valHistory !== null ? valHistory * ssnScaleK : null,
        dmdSSN_forecast: valForecast !== null ? valForecast * ssnScaleK : null
      };
    });

    const result = {
      predictions: finalPredictions,
      butterflyHistorical: historicalButterfly,
      butterflyForecast: syntheticButterfly,
      butterflyDmdAdjustment: dmdButterflyAdjustment,
      butterflyDmdForecast: dmdButterflyForecast,
      xDomain: [allPredictions[0].yearFloat, allPredictions[allPredictions.length-1].yearFloat]
    };

    cache.set(horizon, { data: result, ts: Date.now() });
    res.status(200).json(result);

  } catch (error) {
    console.error("Forecast API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
