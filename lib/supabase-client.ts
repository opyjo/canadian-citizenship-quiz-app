import { createBrowserClient as originalCreateBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

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

// Using createBrowserClient from @supabase/ssr
const supabase = originalCreateBrowserClient<Database>(
  supabaseUrl,
  supabaseKey
);

export default supabase;
