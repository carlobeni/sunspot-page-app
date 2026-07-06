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

async function checkDatabase() {
  const fileNames = [
    "obs_20260416_164644_08fc6548.png",
    "obs_20260511_164644_08fc6548.png",
    "obs_20260518_164644_08fc6548.png",
    "obs_20260606_164644_08fc6548.png",
    "obs_20260610_164644_08fc6548.png",
    "obs_20260416_164644_08fc6548.jpg",
    "obs_20260511_164644_08fc6548.jpg",
    "obs_20260518_164644_08fc6548.jpg",
    "obs_20260606_164644_08fc6548.jpg",
    "obs_20260610_164644_08fc6548.jpg"
  ];

  const { data, error } = await supabase
    .from("live_captures")
    .select("file_name, obs_datetime")
    .in("file_name", fileNames);

  if (error) {
    console.error("Error querying live_captures:", error);
  } else {
    console.log("Existing records found in DB:", data);
  }
}

checkDatabase();
