import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year } = req.query;

  try {
    let query = supabase
      .from('full_disk_images')
      .select('date_obs')
      .order('date_obs', { ascending: false });

    if (year) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      query = query.gte('date_obs', start).lte('date_obs', end);
    }

    const { data, error } = await query.limit(2000); // 2000 records per year is plenty

    if (error) throw error;

    const availableDates = Array.from(new Set(
      (data || []).map(d => d.date_obs.split('T')[0])
    )).sort((a, b) => b.localeCompare(a));

    res.status(200).json({ availableDates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
