import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "dummy_key";

if (typeof window === 'undefined' && (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY)) {
  console.warn("⚠️ Missing Supabase environment variables on server side! Check your .env file.");
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey);
