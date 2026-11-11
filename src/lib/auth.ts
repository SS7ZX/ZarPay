import "server-only";

import { redirect } from "next/navigation";
import type { Profile } from "@/src/types";
import { getProfileName } from "@/src/lib/profile-name";
import { createClient } from "@/src/lib/supabase/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getServiceRoleKey } from "@/src/lib/supabase/env";
import {
  isDatabaseSetupError,
  SupabaseSchemaSetupError,
} from "@/src/lib/supabase/schema-errors";

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

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error(
      "Failed to load user profile:",
      profileError.code,
      profileError.message,
    );
    if (isDatabaseSetupError(profileError)) {
      throw new SupabaseSchemaSetupError();
    }
    throw new Error("Profil pengguna gagal dimuat.");
  }

  let profile = existingProfile;
  if (!profile) {
    if (!getServiceRoleKey()) {
      console.error(
        "Authenticated user has no profile and the server service role key is missing.",
      );
      throw new SupabaseSchemaSetupError();
    }

    const { error: provisionError } = await createAdminClient()
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: getProfileName(user.user_metadata, user.email),
          role: "borrower",
        },
        { onConflict: "id", ignoreDuplicates: true },
      );

    if (provisionError) {
      console.error(
        "Failed to provision missing user profile:",
        provisionError.code,
        provisionError.message,
      );
      if (isDatabaseSetupError(provisionError)) {
        throw new SupabaseSchemaSetupError();
      }
      throw new Error("Profil akun gagal disiapkan.");
    }

    const { data: provisionedProfile, error: reloadError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (reloadError) {
      console.error(
        "Failed to reload user profile:",
        reloadError.code,
        reloadError.message,
      );
      if (isDatabaseSetupError(reloadError)) {
        throw new SupabaseSchemaSetupError();
      }
      throw new Error("Profil pengguna gagal dimuat.");
    }
    if (!provisionedProfile) {
      throw new Error("Profil pengguna belum dapat disiapkan.");
    }
    profile = provisionedProfile;
  }

  return {
    supabase,
    profile,
    email: user.email ?? "",
  };
}
