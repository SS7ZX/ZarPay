import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { calculateScore } from "@/src/lib/scoringEngine";
import { isSameOriginRequest, jsonError } from "@/src/lib/http";
import { validateApplication } from "@/src/lib/validators";
import { getApplicationSaveErrorMessage } from "@/src/lib/application-save-error";
import {
  getServiceRoleKey,
  getSupabaseEnvironment,
} from "@/src/lib/supabase/env";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return jsonError("Permintaan lintas origin tidak diizinkan.", 403);
  }
  if (!getSupabaseEnvironment()) {
    return jsonError("Konfigurasi server Supabase belum lengkap.", 503);
  }
  if (!getServiceRoleKey()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY harus berisi service-role atau secret key dari project yang sama.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Isi permintaan bukan JSON yang valid.", 400);
  }

  const validation = validateApplication(body);
  if (!validation.value) {
    return NextResponse.json(
      { error: "Periksa kembali data pengajuan.", fields: validation.errors },
      { status: 422 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return jsonError("Silakan masuk terlebih dahulu.", 401);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Failed to verify applicant role:", profileError.message);
    return jsonError("Peran akun gagal diverifikasi.", 500);
  }
  if (profile?.role !== "borrower") {
    return jsonError("Hanya akun borrower yang dapat mengajukan pinjaman.", 403);
  }

  const input = validation.value;
  const scoring = calculateScore(input);
  const admin = createAdminClient();
  const { data: application, error } = await admin
    .from("applications")
    .insert({
      borrower_id: user.id,
      applicant_name: profile.full_name,
      monthly_income: input.monthlyIncome,
      monthly_debt: input.monthlyDebt,
      loan_amount: input.loanAmount,
      loan_term_months: input.loanTermMonths,
      estimated_payment: scoring.estimatedPayment,
      dti_ratio: scoring.dtiRatio,
      employment_years: input.employmentYears,
      credit_history_years: input.creditHistoryYears,
      recent_defaults: input.recentDefaults,
      credit_score: scoring.creditScore,
      risk_tier: scoring.riskTier,
      score_factors: scoring.scoreFactors.map((factor) => ({
        label: factor.label,
        points: factor.points,
        maximum: factor.maximum,
        explanation: factor.explanation,
      })),
      status: "pending",
    })
    .select("id, credit_score, risk_tier, dti_ratio, estimated_payment")
    .single();

  if (error) {
    const reference = randomUUID();
    console.error("Failed to save loan application:", {
      reference,
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      {
        error: getApplicationSaveErrorMessage(error.code),
        reference,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ application, scoring }, { status: 201 });
}
