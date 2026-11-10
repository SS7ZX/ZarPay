import { Suspense } from "react";
import { connection } from "next/server";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DashboardClient } from "@/src/components/dashboard/dashboard-client";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import type { DashboardApplication, ScoreFactor } from "@/src/types";

function parseScoreFactors(value: unknown): ScoreFactor[] {
  if (!Array.isArray(value)) {
    throw new Error("Data faktor skor tidak valid pada database.");
  }
  return value.map((factor) => {
    if (
      typeof factor !== "object" ||
      factor === null ||
      !("label" in factor) ||
      !("points" in factor) ||
      !("maximum" in factor) ||
      !("explanation" in factor) ||
      typeof factor.label !== "string" ||
      typeof factor.points !== "number" ||
      typeof factor.maximum !== "number" ||
      typeof factor.explanation !== "string"
    ) {
      throw new Error("Data faktor skor tidak valid pada database.");
    }
    return {
      label: factor.label,
      points: factor.points,
      maximum: factor.maximum,
      explanation: factor.explanation,
    };
  });
}

export default function DashboardPage() {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Memuat dashboard ZarPay...</main>}>
      <AuthenticatedDashboard />
    </Suspense>
  );
}

async function AuthenticatedDashboard() {
  await connection();
  const { supabase, profile, email } = await getAuthenticatedProfile();
  const { data: rows, error } = await supabase
    .from("applications")
    .select(
      "id, borrower_id, applicant_name, monthly_income, monthly_debt, loan_amount, loan_term_months, estimated_payment, dti_ratio, employment_years, credit_history_years, recent_defaults, credit_score, risk_tier, score_factors, status, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load dashboard applications:", error.message);
    throw new Error("Daftar pengajuan gagal dimuat.");
  }

  const borrowerIds = [...new Set((rows ?? []).map((row) => row.borrower_id))];
  const { data: profiles, error: profilesError } = borrowerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", borrowerIds)
    : { data: [], error: null };

  if (profilesError) {
    console.error("Failed to load borrower names:", profilesError.message);
    throw new Error("Nama peminjam gagal dimuat.");
  }
  const names = new Map((profiles ?? []).map((item) => [item.id, item.full_name]));
  const applications: DashboardApplication[] = (rows ?? []).map((row) => ({
    ...row,
    score_factors: parseScoreFactors(row.score_factors),
    borrower_name: names.get(row.borrower_id) ?? row.applicant_name,
  }));

  return (
    <DashboardClient
      applications={applications}
      email={email}
      profile={profile}
    />
  );
}
