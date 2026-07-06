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

async function insertLiveCaptures() {
  // 1. Fetch template metadata
  const { data: baseData, error: fetchError } = await supabase
    .from("live_captures")
    .select("metadata_json")
    .eq("file_name", "obs_20260505_164644_08fc6548.jpg")
    .single();

  if (fetchError) {
    console.error("Error fetching base capture metadata:", fetchError);
    return;
  }

  const baseMetadata = baseData.metadata_json;
  console.log("Using base metadata:", baseMetadata);

  // 2. Define records to insert
  const filesToInsert = [
    {
      obs_datetime: "2026-04-16T16:46:44.000000+00:00",
      file_name: "obs_20260416_164644_08fc6548.png",
      storage_path: "images/obs_20260416_164644_08fc6548.png"
    },
    {
      obs_datetime: "2026-05-11T16:46:44.000000+00:00",
      file_name: "obs_20260511_164644_08fc6548.png",
      storage_path: "images/obs_20260511_164644_08fc6548.png"
    },
    {
      obs_datetime: "2026-05-18T16:46:44.000000+00:00",
      file_name: "obs_20260518_164644_08fc6548.png",
      storage_path: "images/obs_20260518_164644_08fc6548.png"
    },
    {
      obs_datetime: "2026-06-10T16:46:44.000000+00:00",
      file_name: "obs_20260610_164644_08fc6548.png",
      storage_path: "images/obs_20260610_164644_08fc6548.png"
    }
  ];

  const records = filesToInsert.map(item => ({
    obs_datetime: item.obs_datetime,
    file_name: item.file_name,
    storage_bucket: "snapshots",
    storage_path: item.storage_path,
    metadata_json: baseMetadata
  }));

  console.log("Inserting records:", JSON.stringify(records, null, 2));

  // 3. Perform insertion
  const { data: insertedData, error: insertError } = await supabase
    .from("live_captures")
    .insert(records)
    .select();

  if (insertError) {
    console.error("Error inserting live_captures:", insertError);
  } else {
    console.log("Successfully inserted records:", insertedData);
  }
}

insertLiveCaptures();
