import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ApplicationForm } from "@/src/components/forms/application-form";
import { ConfigMessage } from "@/src/components/common/config-message";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";

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
  const { profile } = await getAuthenticatedProfile();
  if (profile.role !== "borrower") redirect("/dashboard");
  return <ApplicationForm applicantName={profile.full_name} />;
}
