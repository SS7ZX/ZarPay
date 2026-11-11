import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/src/components/auth/auth-form";
import { ConfigMessage } from "@/src/components/common/config-message";
import { getSupabaseEnvironment } from "@/src/lib/supabase/env";
import { createClient } from "@/src/lib/supabase/server";

interface LoginPageProps {
  searchParams: Promise<{ error?: string | string[] }>;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const environment = getSupabaseEnvironment();
  if (!environment) return <ConfigMessage />;
  return (
    <Suspense fallback={<main className="loading-screen" aria-busy="true">Menyiapkan halaman masuk...</main>}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const initialError =
    error === "confirmation"
      ? "Konfirmasi email gagal atau tautan sudah tidak berlaku. Silakan coba kembali."
      : error === "configuration"
        ? "Autentikasi belum dikonfigurasi dengan lengkap."
        : "";
  return <AuthForm initialError={initialError} />;
}
