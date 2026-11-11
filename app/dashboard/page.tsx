import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DatabaseSetupMessage } from "@/src/components/common/database-setup-message";
import { DashboardClient } from "@/src/components/dashboard/dashboard-client";
import { getAuthenticatedProfile } from "@/src/lib/auth";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import {
  isDatabaseSetupError,
  SupabaseSchemaSetupError,
} from "@/src/lib/supabase/schema-errors";
import { parseScoreFactors } from "@/src/lib/score-factors";
import type {
  ApplicationStatus,
  DashboardApplication,
  DashboardStats,
} from "@/src/types";

const PAGE_SIZE = 25;

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    status?: string | string[];
  }>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): "all" | ApplicationStatus {
  return value === "pending" || value === "approved" || value === "declined"
    ? value
    : "all";
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Memuat dashboard ZarPay...</main>}>
      <AuthenticatedDashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthenticatedDashboard({ searchParams }: DashboardPageProps) {
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
  const params = await searchParams;
  const searchQuery = (firstValue(params.q) ?? "").trim().slice(0, 100);
  const requestedStatus = firstValue(params.status);
  const statusFilter =
    requestedStatus === undefined && profile.role === "evaluator"
      ? "pending"
      : parseStatus(requestedStatus);
  const requestedPage = parsePage(firstValue(params.page));

  if (!supabase) {
    throw new Error("Supabase client tidak tersedia.");
  }

  const applicationCountQuery = supabase
    .from("applications")
    .select("id", { count: "exact", head: true });
  if (statusFilter !== "all") {
    applicationCountQuery.eq("status", statusFilter);
  }
  if (searchQuery) {
    if (isUuid(searchQuery)) {
      applicationCountQuery.eq("id", searchQuery);
    } else {
      applicationCountQuery.ilike(
        "applicant_name",
        `%${escapeLikePattern(searchQuery)}%`,
      );
    }
  }

  const [countResult, statsResult] = await Promise.all([
    applicationCountQuery,
    supabase.rpc("dashboard_stats"),
  ]);
  if (countResult.error) {
    console.error(
      "Failed to count dashboard applications:",
      countResult.error.code,
      countResult.error.message,
    );
    if (isDatabaseSetupError(countResult.error)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Jumlah pengajuan gagal dimuat.");
  }
  if (statsResult.error || !statsResult.data?.[0]) {
    console.error(
      "Failed to load dashboard statistics:",
      statsResult.error?.code,
      statsResult.error?.message ?? "No statistics row returned.",
    );
    if (!statsResult.error || isDatabaseSetupError(statsResult.error)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Ringkasan pengajuan gagal dimuat.");
  }

  const totalCount = countResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  if (page !== requestedPage) {
    const canonicalParams = new URLSearchParams();
    canonicalParams.set("page", String(page));
    if (searchQuery) canonicalParams.set("q", searchQuery);
    if (statusFilter !== "all") canonicalParams.set("status", statusFilter);
    redirect(`/dashboard?${canonicalParams.toString()}`);
  }

  const applicationQuery = supabase
    .from("applications")
    .select(
      "id, borrower_id, applicant_name, monthly_income, monthly_debt, loan_amount, loan_term_months, estimated_payment, dti_ratio, employment_years, credit_history_years, recent_defaults, credit_score, risk_tier, score_factors, status, reviewed_at, reviewed_by, review_note, created_at",
    );
  if (statusFilter !== "all") {
    applicationQuery.eq("status", statusFilter);
  }
  if (searchQuery) {
    if (isUuid(searchQuery)) {
      applicationQuery.eq("id", searchQuery);
    } else {
      applicationQuery.ilike(
        "applicant_name",
        `%${escapeLikePattern(searchQuery)}%`,
      );
    }
  }

  const { data: rows, error } = await applicationQuery
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (error) {
    console.error(
      "Failed to load dashboard applications:",
      error.code,
      error.message,
    );
    if (isDatabaseSetupError(error)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Daftar pengajuan gagal dimuat.");
  }

  const borrowerIds = [...new Set((rows ?? []).map((row) => row.borrower_id))];
  const reviewerIds =
    profile.role === "evaluator"
      ? [
          ...new Set(
            (rows ?? [])
              .map((row) => row.reviewed_by)
              .filter((id): id is string => Boolean(id)),
          ),
        ]
      : [];
  const profileIds = [...new Set([...borrowerIds, ...reviewerIds])];
  const { data: profiles, error: profilesError } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds)
    : { data: [], error: null };

  if (profilesError) {
    console.error(
      "Failed to load borrower names:",
      profilesError.code,
      profilesError.message,
    );
    if (isDatabaseSetupError(profilesError)) {
      return <DatabaseSetupMessage />;
    }
    throw new Error("Nama peminjam gagal dimuat.");
  }
  const names = new Map((profiles ?? []).map((item) => [item.id, item.full_name]));
  const applications: DashboardApplication[] = (rows ?? []).map((row) => ({
    ...row,
    score_factors: parseScoreFactors(row.score_factors),
    reviewer_name: row.reviewed_by
      ? names.get(row.reviewed_by) ?? null
      : null,
    borrower_name: names.get(row.borrower_id) ?? row.applicant_name,
  }));
  const statsRow = statsResult.data[0];
  const stats: DashboardStats = {
    totalApplications: Number(statsRow.total_applications),
    pendingApplications: Number(statsRow.pending_applications),
    averageCreditScore:
      statsRow.average_credit_score === null
        ? null
        : Number(statsRow.average_credit_score),
    totalLoanValue: statsRow.total_loan_value,
  };

  return (
    <DashboardClient
      key={`${page}:${searchQuery}:${statusFilter}`}
      applications={applications}
      email={email}
      page={page}
      pageSize={PAGE_SIZE}
      profile={profile}
      searchQuery={searchQuery}
      stats={stats}
      statusFilter={statusFilter}
      totalCount={totalCount}
    />
  );
}
