"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

interface AuthFormProps {
  siteUrl: string;
  initialError?: string;
}

export function AuthForm({ siteUrl, initialError = "" }: AuthFormProps) {
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
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Periksa email Anda untuk mengonfirmasi akun sebelum masuk.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
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
      <section className="auth-card">
        <Link className="brand-lockup" href="/" aria-label="ZarPay beranda">
          <span className="brand-mark">Z</span>
          <span>ZarPay</span>
        </Link>
        <p className="eyebrow">PENILAIAN KREDIT YANG TRANSPARAN</p>
        <h1>{mode === "signin" ? "Selamat datang kembali" : "Buat akun ZarPay"}</h1>
        <p className="muted-copy">
          {mode === "signin"
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
        <p className="security-note">
          Data akun diamankan oleh Supabase Auth. Peran evaluator hanya dapat
          diberikan oleh administrator project.
        </p>
      </section>
    </main>
  );
}
