import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ApplicationForm } from "@/src/components/forms/application-form";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DatabaseSetupMessage } from "@/src/components/common/database-setup-message";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import { SupabaseSchemaSetupError } from "@/src/lib/supabase/schema-errors";

export default function ApplyPage() {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Menyiapkan formulir...</main>}>
      <AuthenticatedApplyPage />
    </Suspense>
  );
}

async function AuthenticatedApplyPage() {
  await connection();
  let profile;
  try {
    ({ profile } = await getAuthenticatedProfile());
  } catch (error) {
    if (error instanceof SupabaseSchemaSetupError) {
      return <DatabaseSetupMessage />;
    }
    throw error;
  }
  if (profile.role !== "borrower") redirect("/dashboard");
  return <ApplicationForm applicantName={profile.full_name} />;
}
