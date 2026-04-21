import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

// In-memory cache to prevent Supabase saturation
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return cached version if available and fresh
    if (cachedData && (Date.now() - cacheTimestamp < CACHE_TTL)) {
      return res.status(200).json({ ...cachedData, fromCache: true });
    }

    // 1. Fetch all crops using concurrent pagination to bypass 1000 row limits
    const pageSize = 1000;
    const maxPages = 50; // up to 50,000 crops to cover full 2010-2024 range
    const fetchPromises = [];
    
    for (let i = 0; i < maxPages; i++) {
      fetchPromises.push(
        supabase.from('sunspot_crops')
          .select('date_obs, lat, lon, area')
          .range(i * pageSize, (i + 1) * pageSize - 1)
      );
    }
    
    const results = await Promise.all(fetchPromises);
    const crops = results.flatMap(r => r.data || []);
    const monthlyDataMap = new Map<string, any>();
    const binnedButterfly = new Map<string, any>();

    // a. Monthly aggregation for Number of Manchas from full_disk_images
    // Paginate to get up to 5000 disk image records (covering ~14 years of daily/sub-daily records)
    const diskPromises = [];
    for (let i = 0; i < 5; i++) {
        diskPromises.push(
            supabase.from('full_disk_images')
                .select('date_obs, num_crops')
                .range(i * 1000, (i + 1) * 1000 - 1)
        );
    }
    const diskResults = await Promise.all(diskPromises);
    const disks = diskResults.flatMap(r => r.data || []);

    if (diskResults.some(r => r.error)) throw new Error("Error fetching disk images");

    disks?.forEach((disk: any) => {
        if (disk.date_obs) {
            const date = new Date(disk.date_obs);
            const ymKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyDataMap.has(ymKey)) {
                monthlyDataMap.set(ymKey, { month: ymKey, ssn: 0, lats: [], lons: [] });
            }
            const mData = monthlyDataMap.get(ymKey);
            mData.ssn += (disk.num_crops || 0);
        }
    });

    // b. Butterfly diagram positions from sunspot_crops
    crops.forEach((crop: any) => {
      if (crop.date_obs) {
        const date = new Date(crop.date_obs);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthKey = `${year}-${String(month).padStart(2, '0')}`;
        
        const mData = monthlyDataMap.get(monthKey);
        if (mData) {
            if (crop.lat !== null) mData.lats.push(crop.lat);
            if (crop.lon !== null) mData.lons.push(crop.lon);
        }

        // 2. Butterfly diagram binning
        const yearFloat = year + (month - 1) / 12 + date.getDate() / 365;
        if (crop.lat !== null) {
          const binnedYear = yearFloat.toFixed(1);
          const binnedLat = (Math.round(crop.lat / 2) * 2).toFixed(1);
          const key = `${binnedYear}_${binnedLat}`;
          const area = crop.area || 50;

          if (!binnedButterfly.has(key)) {
            binnedButterfly.set(key, {
              year: Number(binnedYear),
              lat: Number(binnedLat),
              lon: crop.lon,
              area: area,
            });
          } else {
            const existing = binnedButterfly.get(key);
            existing.area = Math.max(existing.area, area);
          }
        }
      }
    });

    const monthlyStats = Array.from(monthlyDataMap.values())
        .map(d => ({
            month: d.month,
            ssn: d.ssn,
            avgLat: d.lats.length > 0 ? d.lats.reduce((a: any, b: any) => a + b, 0) / d.lats.length : null,
            avgLon: d.lons.length > 0 ? d.lons.reduce((a: any, b: any) => a + b, 0) / d.lons.length : null
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const butterflyData = Array.from(binnedButterfly.values());

    let minYear = 2010;
    let maxYear = 2024;
    
    if (butterflyData.length > 0) {
       minYear = Math.floor(Math.min(...butterflyData.map(d => d.year)));
       maxYear = Math.ceil(Math.max(...butterflyData.map(d => d.year)));
       if (minYear === maxYear) { maxYear += 1; minYear -= 1; }
    }

    // 2. Fetch exact list of valid dates strictly evaluating physical bucket files, not DB records
    const { data: diskFiles } = await supabase.storage
      .from('full-disk-images')
      .list('images', { limit: 5000, sortBy: { column: 'name', order: 'desc' } });

    const parsedDates = (diskFiles || [])
      .map(f => {
        const match = f.name.match(/([0-9]{8})/);
        if (match) {
          const d = match[1];
          return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
        }
        return null;
      })
      .filter(Boolean) as string[];

    const availableDates = Array.from(new Set(parsedDates)).sort((a, b) => b.localeCompare(a));

    const totalReportedInDisks = disks.reduce((sum: number, d: any) => sum + (d.num_crops || 0), 0);
    const totalCropsLoaded = crops.length;

    cachedData = {
      monthlyStats,
      butterflyData,
      minYear,
      maxYear,
      availableDates,
      debug: {
          totalCropsLoaded,
          totalReportedInDisks,
          totalDiskImages: disks.length
      }
    };
    cacheTimestamp = Date.now();

    res.status(200).json({ ...cachedData, fromCache: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
