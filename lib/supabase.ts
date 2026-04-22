import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn("⚠️ Missing Supabase NEXT_PUBLIC_ variables on client side! Auth will not work.");
  }
}

export const createClient = () => {
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
};

// Singleton instance for general use on the client
export const supabase = createClient();
