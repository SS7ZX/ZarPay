import { Suspense } from "react";
import { connection } from "next/server";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DatabaseSetupMessage } from "@/src/components/common/database-setup-message";
import {
  ProfileOverview,
  type ProfileApplication,
} from "@/src/components/profile/profile-overview";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { parseScoreFactors } from "@/src/lib/score-factors";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import {
  isDatabaseSetupError,
  SupabaseSchemaSetupError,
} from "@/src/lib/supabase/schema-errors";

export default function ProfilePage() {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Memuat profil...</main>}>
      <AuthenticatedProfile />
    </Suspense>
  );
}

async function AuthenticatedProfile() {
  await connection();
  let authenticated: Awaited<ReturnType<typeof getAuthenticatedProfile>>;
  try {
    authenticated = await getAuthenticatedProfile();
  } catch (error) {
    if (error instanceof SupabaseSchemaSetupError) {
      return <DatabaseSetupMessage />;
    }
    throw error;
  }

  const { supabase, profile, email } = authenticated;
  const [countResult, applicationsResult] = await Promise.all([
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("borrower_id", profile.id),
    supabase
      .from("applications")
      .select(
        "id, loan_amount, loan_term_months, estimated_payment, dti_ratio, credit_score, risk_tier, score_factors, status, review_note, created_at",
      )
      .eq("borrower_id", profile.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(10),
  ]);

  const queryError = countResult.error ?? applicationsResult.error;
  if (queryError) {
    console.error(
      "Failed to load profile applications:",
      queryError.code,
      queryError.message,
    );
    if (isDatabaseSetupError(queryError)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Riwayat profil gagal dimuat.");
  }

  const applications: ProfileApplication[] = (applicationsResult.data ?? []).map(
    (application) => ({
      ...application,
      score_factors: parseScoreFactors(application.score_factors),
    }),
  );

  return (
    <ProfileOverview
      applications={applications}
      email={email}
      profile={profile}
      totalApplications={countResult.count ?? 0}
    />
  );
}
