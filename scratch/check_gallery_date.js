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

async function checkGalleryDate() {
  const { data, error } = await supabase
    .from("live_captures")
    .select("obs_datetime")
    .limit(1);
    
  if (error) {
    console.error(error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log("obs_datetime raw:", data[0].obs_datetime);
    console.log("Type of obs_datetime:", typeof data[0].obs_datetime);
  } else {
    console.log("No records in live_captures");
  }
}

checkGalleryDate();
