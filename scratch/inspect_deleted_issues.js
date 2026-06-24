const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- LATEST 10 RECORDS IN full_disk_images ---");
  const { data: latestRecords, error: err1 } = await supabase
    .from("full_disk_images")
    .select("id, date_obs, file_name, storage_bucket, storage_path")
    .order("date_obs", { ascending: false })
    .limit(10);
    
  if (err1) {
    console.error("Error fetching latest records:", err1);
  } else {
    console.log(latestRecords);
  }

  console.log("\n--- DATES WITH MULTIPLE RECORDS ---");
  const { data: allDates, error: err2 } = await supabase
    .from("full_disk_images")
    .select("date_obs");
    
  if (err2) {
    console.error("Error fetching all dates:", err2);
  } else {
    const counts = {};
    allDates.forEach(r => {
      const d = r.date_obs.split('T')[0];
      counts[d] = (counts[d] || 0) + 1;
    });
    const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
    console.log("Duplicate dates:", duplicates);
  }

  console.log("\n--- IMAGES LIST IN STORAGE BUCKET (full-disk-images) ---");
  const { data: bucketFiles, error: err3 } = await supabase.storage
    .from("full-disk-images")
    .list("images", { limit: 10, sortBy: { column: 'name', order: 'desc' } });
    
  if (err3) {
    console.error("Error listing storage bucket:", err3);
  } else {
    console.log(bucketFiles.map(f => ({ name: f.name, created_at: f.created_at })));
  }
}

run();
