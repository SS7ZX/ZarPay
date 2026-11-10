import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginRequest, jsonError } from "@/src/lib/http";
import {
  getServiceRoleKey,
  getSupabaseEnvironment,
} from "@/src/lib/supabase/env";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isSameOriginRequest(request)) {
    return jsonError("Permintaan lintas origin tidak diizinkan.", 403);
  }
  if (!getSupabaseEnvironment() || !getServiceRoleKey()) {
    return jsonError("Konfigurasi server Supabase belum lengkap.", 503);
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return jsonError("ID pengajuan tidak valid.", 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Isi permintaan bukan JSON yang valid.", 400);
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("status" in body) ||
    (body.status !== "approved" && body.status !== "declined")
  ) {
    return jsonError("Status evaluasi tidak valid.", 422);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return jsonError("Silakan masuk terlebih dahulu.", 401);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Failed to verify evaluator role:", profileError.message);
    return jsonError("Peran akun gagal diverifikasi.", 500);
  }
  if (profile?.role !== "evaluator") {
    return jsonError("Hanya evaluator yang dapat memperbarui keputusan.", 403);
  }

  const admin = createAdminClient();
  const { data: application, error } = await admin
    .from("applications")
    .update({ status: body.status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select("id, status, reviewed_at")
    .maybeSingle();

  if (error) {
    console.error("Failed to update application review:", error.message);
    return jsonError("Keputusan gagal disimpan.", 500);
  }
  if (!application) {
    return jsonError("Pengajuan tidak ditemukan atau sudah ditinjau.", 404);
  }

  return NextResponse.json({ application });
}
