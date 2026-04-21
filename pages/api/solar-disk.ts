import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { date } = req.query;

    let queryDate = date as string;

    // If no date provided, fetch the most recent full disk
    if (!queryDate) {
      const { data: latest } = await supabase
        .from('full_disk_images')
        .select('date_obs')
        .order('date_obs', { ascending: false })
        .limit(1);
      
      if (latest && latest.length > 0) {
        queryDate = latest[0].date_obs;
      } else {
        return res.status(404).json({ error: "No datasets available" });
      }
    }

    // 1. Fetch the full_disk_images for this date
    const { data: fullDisks, error: fdError } = await supabase
      .from('full_disk_images')
      .select('*')
      .eq('date_obs', queryDate)
      .limit(1);

    if (fdError) {
      return res.status(500).json({ error: fdError.message });
    }

    if (!fullDisks || fullDisks.length === 0) {
      // If we don't find the exact date requested, try fetching the first available
      if (date) {
        const { data: anyDisk } = await supabase
          .from('full_disk_images')
          .select('*')
          .order('date_obs', { ascending: false })
          .limit(1);
        
        if (anyDisk && anyDisk.length > 0) {
           fullDisks.push(anyDisk[0]);
        } else {
            return res.status(404).json({ error: "No full disk image found for this date." });
        }
      } else {
         return res.status(404).json({ error: "No full disk image found for this date." });
      }
    }

    const fullDisk = fullDisks[0];
    
    // Correct the bucket name if it's 'solar-full-disks' in DB but 'full-disk-images' in Storage
    const fullDiskBucket = fullDisk.storage_bucket === 'solar-full-disks' ? 'full-disk-images' : fullDisk.storage_bucket;
    // Database storage_path is outdated, files are just grouped in images folder by their file name.
    // The bucket files for full-disks use uppercase prefix HMI_ instead of hmi_ string stored in DB `file_name`.
    const fullDiskPath = `images/${fullDisk.file_name}`;

    const { data: fdSigned, error: fdSignedError } = await supabase.storage.from(fullDiskBucket).createSignedUrl(fullDiskPath, 3600);
    
    if (fdSignedError) {
      console.error("Full Disk Signed URL error:", fdSignedError);
      return res.status(500).json({ error: `Full Disk Signed URL error: ${fdSignedError.message}` });
    }
    const fullDiskUrl = fdSigned.signedUrl;

    // 2. Fetch the corresponding crops
    const { data: crops, error: cropsError } = await supabase
      .from('sunspot_crops')
      .select('*')
      .eq('full_disk_image_id', fullDisk.id);

    if (cropsError) {
      return res.status(500).json({ error: cropsError.message });
    }

    // Process crops to get signed URLs in bulk
    let processedCrops = [];
    if (crops && crops.length > 0) {
      const cropBucket = crops[0].storage_bucket || 'sunspot-crops';
      // Use crop_filename instead of outdated storage_path in DB
      const cropPaths = crops.map((c: any) => `images/${c.crop_filename}`);
      
      const { data: signedUrls, error: signedUrlsError } = await supabase.storage
        .from(cropBucket)
        .createSignedUrls(cropPaths, 3600);

      if (signedUrlsError) {
        console.error("Crops Signed URL error:", signedUrlsError);
      }

      processedCrops = crops.map((crop: any, idx: number) => {
        const mappedUrl = signedUrls?.find(s => s.path === `images/${crop.crop_filename}`)?.signedUrl;
        return {
          ...crop,
          cropUrl: mappedUrl || null
        };
      });
    }

    res.status(200).json({ 
      date: fullDisk.date_obs,
      fullDiskUrl: fullDiskUrl,
      fullDiskMetadata: fullDisk,
      crops: processedCrops
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
