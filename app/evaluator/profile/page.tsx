import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DatabaseSetupMessage } from "@/src/components/common/database-setup-message";
import {
  EvaluatorProfileOverview,
  type EvaluatorReviewRecord,
} from "@/src/components/profile/evaluator-profile-overview";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import {
  isDatabaseSetupError,
  SupabaseSchemaSetupError,
} from "@/src/lib/supabase/schema-errors";

export default function EvaluatorProfilePage() {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense
      fallback={
        <main className="loading-screen" aria-busy="true">
          Memuat profil evaluator...
        </main>
      }
    >
      <AuthenticatedEvaluatorProfile />
    </Suspense>
  );
}

async function AuthenticatedEvaluatorProfile() {
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
  if (profile.role !== "evaluator") redirect("/dashboard");
  if (!supabase) {
    throw new Error("Supabase client tidak tersedia.");
  }

  const [reviewedResult, approvedResult, declinedResult, recentResult, statsResult] =
    await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("reviewed_by", profile.id)
        .in("status", ["approved", "declined"]),
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("reviewed_by", profile.id)
        .eq("status", "approved"),
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("reviewed_by", profile.id)
        .eq("status", "declined"),
      supabase
        .from("applications")
        .select(
          "id, applicant_name, loan_amount, credit_score, risk_tier, status, created_at, reviewed_at, review_note",
        )
        .eq("reviewed_by", profile.id)
        .in("status", ["approved", "declined"])
        .order("reviewed_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(10),
      supabase.rpc("dashboard_stats"),
    ]);

  const queryError =
    reviewedResult.error ??
    approvedResult.error ??
    declinedResult.error ??
    recentResult.error;
  if (queryError) {
    console.error(
      "Failed to load evaluator review analytics:",
      queryError.code,
      queryError.message,
    );
    if (isDatabaseSetupError(queryError)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Analisis profil evaluator gagal dimuat.");
  }
  if (statsResult.error || !statsResult.data?.[0]) {
    console.error(
      "Failed to load evaluator queue statistics:",
      statsResult.error?.code,
      statsResult.error?.message ?? "No statistics row returned.",
    );
    if (!statsResult.error || isDatabaseSetupError(statsResult.error)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Antrian pengajuan gagal dimuat.");
  }

  type RawReview = NonNullable<typeof recentResult.data>[number];
  const recentReviews: EvaluatorReviewRecord[] = (recentResult.data ?? [])
    .filter(
      (review): review is RawReview & { status: "approved" | "declined" } =>
        review.status === "approved" || review.status === "declined",
    )
    .map((review) => ({ ...review }));

  return (
    <EvaluatorProfileOverview
      approvedCount={approvedResult.count ?? 0}
      declinedCount={declinedResult.count ?? 0}
      email={email}
      pendingQueueCount={Number(statsResult.data[0].pending_applications)}
      profile={profile}
      recentReviews={recentReviews}
      reviewedCount={reviewedResult.count ?? 0}
    />
  );
}
