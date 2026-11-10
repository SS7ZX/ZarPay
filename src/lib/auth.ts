import "server-only";

import { redirect } from "next/navigation";
import type { Profile } from "@/src/types";
import { createClient } from "@/src/lib/supabase/server";

export async function getAuthenticatedProfile(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: Profile;
  email: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load user profile:", profileError.message);
    throw new Error("Profil pengguna gagal dimuat.");
  }
  if (!profile) {
    throw new Error(
      "Profil belum tersedia. Pastikan trigger profiles pada migrasi Supabase sudah terpasang.",
    );
  }

  return {
    supabase,
    profile,
    email: user.email ?? "",
  };
}
