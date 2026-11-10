import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/src/types";
import { getSupabaseEnvironment } from "./env";

export async function createClient() {
  const environment = getSupabaseEnvironment();
  if (!environment) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }
  const cookieStore = await cookies();

  return createServerClient<Database>(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot write cookies; proxy.ts refreshes sessions.
          }
        },
      },
    },
  );
}
