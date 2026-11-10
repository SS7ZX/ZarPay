"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types";
import { getSupabaseEnvironment } from "./env";

let client: SupabaseClient<Database> | undefined;

export function createClient(): SupabaseClient<Database> {
  if (client) return client;
  const environment = getSupabaseEnvironment();
  if (!environment) {
    throw new Error("Konfigurasi Supabase belum tersedia.");
  }
  client = createBrowserClient<Database>(
    environment.url,
    environment.publishableKey,
  );
  return client;
}
