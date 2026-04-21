const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCrops() {
    console.log("Checking sunspot_crops...");
    const { data: latestCrops, error } = await supabase
        .from('sunspot_crops')
        .select('*')
        .order('date_obs', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching latest crops:", error);
        return;
    }

    console.log("Latest 5 records in sunspot_crops:");
    latestCrops.forEach(c => {
        console.log(`- ID: ${c.id}, File: ${c.crop_filename}, Bucket: ${c.storage_bucket}, Path in DB: ${c.storage_path}`);
    });

    if (latestCrops && latestCrops.length > 0) {
        const crop = latestCrops[0];
        const bucket = crop.storage_bucket || 'sunspot-crops';
        
        console.log(`\nChecking existence for crop: ${crop.crop_filename}`);
        
        // Check in 'images/'
        const { data: imagesFiles } = await supabase.storage.from(bucket).list('images', { search: crop.crop_filename });
        console.log(`Exists in 'images/'? ${imagesFiles?.some(f => f.name === crop.crop_filename) ? "YES" : "NO"}`);

        // Check in the path from DB
        const dbPathParts = crop.storage_path.split('/');
        const dbFolder = dbPathParts.slice(0, -1).join('/');
        const dbFileName = dbPathParts[dbPathParts.length - 1];
        
        const { data: dbPathFiles } = await supabase.storage.from(bucket).list(dbFolder, { search: dbFileName });
        console.log(`Exists in folder '${dbFolder}'? ${dbPathFiles?.some(f => f.name === dbFileName) ? "YES" : "NO"}`);
    }
}

inspectCrops();
