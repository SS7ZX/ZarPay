import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { AuthForm } from "@/src/components/auth/auth-form";
import { ConfigMessage } from "@/src/components/common/config-message";
import { DatabaseSetupMessage } from "@/src/components/common/database-setup-message";
import { createClient } from "@/src/lib/supabase/server";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import { isDatabaseSetupError } from "@/src/lib/supabase/schema-errors";

export default function EvaluatorLoginPage() {
  if (!getSupabaseEnvironment()) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Menyiapkan akses evaluator...</main>}>
      <EvaluatorLoginContent />
    </Suspense>
  );
}

async function EvaluatorLoginContent() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  let initialError = "";
  if (userError) {
    if (userError.name !== "AuthSessionMissingError") {
      console.error("Failed to load evaluator login session:", userError.message);
      initialError = "Sesi akun tidak dapat diverifikasi. Silakan masuk kembali.";
    }
  }
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Failed to verify existing evaluator session:",
        profileError.code,
        profileError.message,
      );
      if (isDatabaseSetupError(profileError)) {
        return <DatabaseSetupMessage />;
      }
      initialError = "Peran akun gagal diverifikasi. Coba masuk kembali.";
    } else if (profile?.role === "evaluator") {
      redirect("/dashboard");
    } else {
      initialError =
        "Sesi saat ini bukan akun evaluator. Masuk dengan akun evaluator yang telah diaktifkan.";
    }
  }

  return <AuthForm evaluatorMode initialError={initialError} />;
}
