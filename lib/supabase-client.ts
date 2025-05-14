import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import "dotenv/config"; // Ensure dotenv is loaded

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is not set in the environment. Please check your .env.local file and ensure it is loaded correctly."
  );
}
if (!supabaseKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in the environment. Please check your .env.local file and ensure it is loaded correctly."
  );
}

// Create and export a single Supabase client instance
const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
