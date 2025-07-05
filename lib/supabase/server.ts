import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type Database } from "@/types/supabase";

export function createSupabaseServerClient() {
  // Renamed for clarity from just createClient
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => {
          const store = await cookieStore;
          return store.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll: async (
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) => {
          try {
            const store = await cookieStore;
            cookiesToSet.forEach((cookie) => {
              // Using type assertion as store.set might not be directly available on ReadonlyRequestCookies
              (store as any).set(cookie.name, cookie.value, cookie.options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This is expected behavior in server components.
          }
        },
      },
    }
  );
}
