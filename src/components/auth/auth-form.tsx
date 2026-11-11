"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { BrandLogo } from "@/src/components/common/brand-logo";

interface AuthFormProps {
  evaluatorMode?: boolean;
  initialError?: string;
}

export function AuthForm({
  evaluatorMode = false,
  initialError = "",
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: new URL("/auth/callback", window.location.origin).toString(),
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Periksa email Anda untuk mengonfirmasi akun sebelum masuk.");
          return;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (evaluatorMode) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

          if (profileError) {
            console.error(
              "Failed to verify evaluator sign-in:",
              profileError.code,
              profileError.message,
            );
            const { error: signOutError } = await supabase.auth.signOut({
              scope: "local",
            });
            if (signOutError) {
              console.error(
                "Failed to clear unverified evaluator session:",
                signOutError.message,
              );
            }
            setErrorMessage(
              signOutError
                ? "Akses evaluator tidak dapat diverifikasi. Keluar dari akun dan coba kembali."
                : "Akses evaluator tidak dapat diverifikasi. Coba kembali.",
            );
            return;
          }

          if (profile?.role !== "evaluator") {
            const { error: signOutError } = await supabase.auth.signOut({
              scope: "local",
            });
            if (signOutError) {
              console.error(
                "Failed to clear non-evaluator session:",
                signOutError.message,
              );
            }
            setErrorMessage(
              signOutError
                ? "Akun ini tidak memiliki akses evaluator. Keluar dari akun lalu hubungi administrator."
                : "Akun ini belum memiliki akses evaluator. Hubungi administrator project.",
            );
            return;
          }
        }
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Autentikasi gagal. Silakan coba kembali.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-brand-panel" aria-label="Tentang simulasi ZarPay">
        <Link className="auth-brand-lockup" href="/" aria-label="ZarPay beranda">
          <BrandLogo />
        </Link>
        <div className="auth-brand-copy">
          <p className="auth-brand-eyebrow">SIMULATOR KREDIT AKADEMIK</p>
          <h2>
            Pahami angkanya.
            <span>Ketahui batasnya.</span>
          </h2>
          <p>
            ZarPay memperlihatkan hubungan antara pendapatan, kewajiban,
            estimasi cicilan, dan faktor penilaian dengan aturan simulasi yang
            terbuka.
          </p>
          <ul>
            <li><span aria-hidden="true">01</span> Estimasi cicilan dan DTI dalam satu tampilan</li>
            <li><span aria-hidden="true">02</span> Rincian faktor yang membentuk skor</li>
            <li><span aria-hidden="true">03</span> Hasil untuk pembelajaran, bukan keputusan kredit</li>
          </ul>
        </div>
        <p className="auth-brand-disclaimer">
          Gunakan angka hipotetis. Jangan masukkan data keuangan atau identitas pribadi.
        </p>
      </section>

      <section className="auth-main" aria-label="Formulir akun ZarPay">
        <Link className="auth-back-link" href="/">
          <span aria-hidden="true">←</span> Kembali ke beranda
        </Link>
        <div className="auth-card">
          <p className="eyebrow">
            {evaluatorMode ? "AKSES EVALUATOR" : "AKUN ZARPAY"}
          </p>
          <h1>
            {evaluatorMode
              ? "Masuk ke panel evaluator"
              : mode === "signin"
                ? "Selamat datang kembali"
                : "Buat akun ZarPay"}
          </h1>
          <p className="muted-copy">
            {evaluatorMode
              ? "Gunakan akun yang telah diberi peran evaluator oleh administrator project."
              : mode === "signin"
                ? "Masuk untuk mengelola pengajuan dan melihat penilaian risiko."
                : "Daftar sebagai peminjam untuk mengajukan simulasi penilaian kredit."}
          </p>

          <form className="form-stack" onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Nama lengkap
                <input
                  autoComplete="name"
                  maxLength={100}
                  minLength={2}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </label>
            )}
            <label>
              Email
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Kata sandi
              <input
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {mode === "signup" && (
                <span className="field-hint">Minimal 8 karakter.</span>
              )}
            </label>
            {errorMessage && (
              <p className="alert alert-error" role="alert">
                {errorMessage}
              </p>
            )}
            {notice && (
              <p className="alert alert-success" role="status">
                {notice}
              </p>
            )}
            <button className="button button-primary button-wide" disabled={isSubmitting}>
              {isSubmitting
                ? "Memproses..."
                : mode === "signin"
                  ? "Masuk"
                  : "Buat akun"}
            </button>
          </form>

          {!evaluatorMode && (
            <p className="auth-switch">
              {mode === "signin" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}{" "}
              <button
                className="text-button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setErrorMessage("");
                  setNotice("");
                }}
                type="button"
              >
                {mode === "signin" ? "Daftar" : "Masuk"}
              </button>
            </p>
          )}
          <p className="auth-switch">
            {evaluatorMode ? "Peminjam?" : "Evaluator?"}{" "}
            <Link
              className="text-button"
              href={evaluatorMode ? "/login" : "/evaluator/login"}
            >
              {evaluatorMode ? "Masuk sebagai peminjam" : "Masuk ke panel evaluator"}
            </Link>
          </p>
          <p className="security-note">
            Data akun diamankan oleh Supabase Auth. Peran evaluator hanya dapat
            diberikan oleh administrator project.
          </p>
        </div>
      </section>
    </main>
  );
}
