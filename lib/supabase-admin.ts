import { createClient } from "@supabase/supabase-js";

// Ensure your Supabase URL and Service Role Key are set in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Or SUPABASE_ACCESS_TOKEN if you named it that

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing env.SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ACCESS_TOKEN"
  );
}

// Note: this is a server-side-only client. DO NOT EXPOSE TO THE BROWSER.
export const createAdminClient = () => {
  // Check again in function call in case env vars are loaded dynamically in some contexts,
  // though for module scope, the above check should suffice.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    // Fallback check for SUPABASE_ACCESS_TOKEN if common naming convention used
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_ACCESS_TOKEN
    ) {
      throw new Error(
        "Supabase URL or Service Role Key/Access Token is not defined in environment variables for admin client."
      );
    }
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ACCESS_TOKEN!
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};
