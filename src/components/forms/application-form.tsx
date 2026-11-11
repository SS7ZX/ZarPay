"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateScore } from "@/src/lib/scoringEngine";
import { validateApplication } from "@/src/lib/validators";
import type { ApplicationInput, ScoringResult } from "@/src/types";
import {
  ApplicationResult,
  ScorePreviewCard,
} from "@/src/components/forms/application-display";

interface ApplicationFormProps {
  applicantName: string;
}

type FieldName = keyof ApplicationInput;
type FormValues = Record<FieldName, string | boolean>;
type FieldErrors = Partial<Record<FieldName, string>>;

function parseScoringResult(value: unknown): ScoringResult | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("creditScore" in value) ||
    !("dtiRatio" in value) ||
    !("estimatedPayment" in value) ||
    !("riskTier" in value) ||
    !("scoreFactors" in value) ||
    typeof value.creditScore !== "number" ||
    typeof value.dtiRatio !== "number" ||
    typeof value.estimatedPayment !== "number" ||
    (value.riskTier !== "low" &&
      value.riskTier !== "moderate" &&
      value.riskTier !== "elevated" &&
      value.riskTier !== "high") ||
    !Array.isArray(value.scoreFactors)
  ) {
    return null;
  }

  const scoreFactors = value.scoreFactors;
  if (
    !scoreFactors.every(
      (factor) =>
        typeof factor === "object" &&
        factor !== null &&
        "label" in factor &&
        "points" in factor &&
        "maximum" in factor &&
        "explanation" in factor &&
        typeof factor.label === "string" &&
        typeof factor.points === "number" &&
        typeof factor.maximum === "number" &&
        typeof factor.explanation === "string",
    )
  ) {
    return null;
  }

  return {
    creditScore: value.creditScore,
    dtiRatio: value.dtiRatio,
    estimatedPayment: value.estimatedPayment,
    riskTier: value.riskTier,
    scoreFactors: scoreFactors.map((factor) => ({
      label: factor.label,
      points: factor.points,
      maximum: factor.maximum,
      explanation: factor.explanation,
    })),
  };
}

const initialValues = (): FormValues => ({
  monthlyIncome: "",
  monthlyDebt: "",
  loanAmount: "",
  loanTermMonths: "",
  employmentYears: "",
  creditHistoryYears: "",
  recentDefaults: "",
});

function responseMessage(payload: unknown): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    const reference =
      "reference" in payload && typeof payload.reference === "string"
        ? payload.reference
        : "";
    return reference ? `${payload.error} (Ref: ${reference})` : payload.error;
  }
  return "Pengajuan gagal disimpan. Silakan coba kembali.";
}

export function ApplicationForm({ applicantName }: ApplicationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [applicationId, setApplicationId] = useState("");

  const preview = useMemo(() => {
    const validation = validateApplication(values);
    return validation.value ? calculateScore(validation.value) : null;
  }, [values]);

  function update(field: FieldName, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestError("");
    setResult(null);
    const validation = validateApplication(values);
    if (!validation.value) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.value),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        if (
          response.status === 422 &&
          typeof payload === "object" &&
          payload !== null &&
          "fields" in payload &&
          typeof payload.fields === "object" &&
          payload.fields !== null
        ) {
          setErrors(payload.fields as FieldErrors);
        }
        throw new Error(responseMessage(payload));
      }

      const application =
        typeof payload === "object" &&
        payload !== null &&
        "application" in payload &&
        typeof payload.application === "object" &&
        payload.application !== null
          ? payload.application
          : null;
      const scoring =
        typeof payload === "object" && payload !== null && "scoring" in payload
          ? parseScoringResult(payload.scoring)
          : null;
      if (
        !application ||
        !("id" in application) ||
        typeof application.id !== "string" ||
        !scoring
      ) {
        throw new Error("Pengajuan tersimpan, tetapi respons hasil tidak valid.");
      }

      setApplicationId(application.id);
      setResult(scoring);
      router.refresh();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Pengajuan gagal disimpan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <ApplicationResult
        applicationId={applicationId}
        onCreateAnother={() => {
          setResult(null);
          setValues(initialValues());
          setErrors({});
          setRequestError("");
        }}
        result={result}
      />
    );
  }

  const setNumeric = (field: FieldName) => (event: ChangeEvent<HTMLInputElement>) =>
    update(field, event.target.value);

  return (
    <main className="main-content form-main">
      <header className="topbar">
        <div>
          <p className="breadcrumb"><Link href="/dashboard">Ringkasan</Link> <span>/</span> Pengajuan baru</p>
          <p className="topbar-date">Profil dan estimasi kemampuan bayar</p>
        </div>
        <Link className="button button-quiet button-small" href="/dashboard">Kembali</Link>
      </header>
      <section className="page-heading form-page-heading">
        <div>
          <p className="eyebrow">PENGAJUAN PINJAMAN</p>
          <h1>Lengkapi profil keuangan</h1>
          <p className="muted-copy">
            Isi informasi berikut untuk mendapatkan simulasi skor kredit yang transparan.
          </p>
        </div>
        <div className="step-indicator"><span>1</span> Profil keuangan <i /> <span className="step-muted">2</span> Hasil simulasi</div>
      </section>

      <div className="form-layout">
        <form className="content-card application-form" onSubmit={submit} noValidate>
          <section className="form-section">
            <div className="form-section-heading">
              <span className="form-section-number">01</span>
              <div><h2>Informasi peminjam</h2><p>Data dasar untuk identifikasi pengajuan.</p></div>
            </div>
            <label>
              Nama sesuai akun
              <span className="applicant-name">{applicantName}</span>
            </label>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span className="form-section-number">02</span>
              <div><h2>Kondisi keuangan</h2><p>Gunakan angka bulanan sebelum pajak untuk pendapatan.</p></div>
            </div>
            <div className="form-grid">
              <label>
                Pendapatan bulanan
                <div className="input-prefix"><span>Rp</span><input inputMode="numeric" min="1" onChange={setNumeric("monthlyIncome")} required type="number" value={String(values.monthlyIncome)} /></div>
                {errors.monthlyIncome && <span className="field-error">{errors.monthlyIncome}</span>}
              </label>
              <label>
                Cicilan / utang bulanan saat ini
                <div className="input-prefix"><span>Rp</span><input inputMode="numeric" min="0" onChange={setNumeric("monthlyDebt")} required type="number" value={String(values.monthlyDebt)} /></div>
                {errors.monthlyDebt && <span className="field-error">{errors.monthlyDebt}</span>}
              </label>
              <label>
                Lama bekerja
                <div className="input-suffix"><input max="60" min="0" onChange={setNumeric("employmentYears")} required step="0.5" type="number" value={String(values.employmentYears)} /><span>tahun</span></div>
                {errors.employmentYears && <span className="field-error">{errors.employmentYears}</span>}
              </label>
              <label>
                Riwayat kredit
                <div className="input-suffix"><input max="60" min="0" onChange={setNumeric("creditHistoryYears")} required step="0.5" type="number" value={String(values.creditHistoryYears)} /><span>tahun</span></div>
                {errors.creditHistoryYears && <span className="field-error">{errors.creditHistoryYears}</span>}
              </label>
            </div>
            <fieldset
              aria-describedby={
                errors.recentDefaults
                  ? "recent-defaults-hint recent-defaults-error"
                  : "recent-defaults-hint"
              }
              aria-invalid={Boolean(errors.recentDefaults)}
              className="choice-fieldset"
            >
              <legend>Apakah Anda memiliki tunggakan dalam 12 bulan terakhir?</legend>
              <p className="choice-hint" id="recent-defaults-hint">
                Pilih salah satu jawaban agar simulasi menggunakan data yang Anda masukkan.
              </p>
              <div className="choice-options">
                <label className="choice-option">
                  <input
                    checked={values.recentDefaults === false}
                    name="recentDefaults"
                    onChange={() => update("recentDefaults", false)}
                    required
                    type="radio"
                    value="false"
                  />
                  <span>Tidak</span>
                </label>
                <label className="choice-option">
                  <input
                    checked={values.recentDefaults === true}
                    name="recentDefaults"
                    onChange={() => update("recentDefaults", true)}
                    required
                    type="radio"
                    value="true"
                  />
                  <span>Ya</span>
                </label>
              </div>
              {errors.recentDefaults && (
                <span className="field-error" id="recent-defaults-error" role="alert">
                  {errors.recentDefaults}
                </span>
              )}
            </fieldset>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span className="form-section-number">03</span>
              <div><h2>Rencana pinjaman</h2><p>Simulasi cicilan menggunakan asumsi bunga tetap 12% per tahun.</p></div>
            </div>
            <div className="form-grid">
              <label>
                Jumlah pinjaman
                <div className="input-prefix"><span>Rp</span><input inputMode="numeric" min="1000000" onChange={setNumeric("loanAmount")} required type="number" value={String(values.loanAmount)} /></div>
                {errors.loanAmount && <span className="field-error">{errors.loanAmount}</span>}
              </label>
              <label>
                Tenor pinjaman
                <div className="input-suffix"><input max="60" min="3" onChange={setNumeric("loanTermMonths")} required type="number" value={String(values.loanTermMonths)} /><span>bulan</span></div>
                {errors.loanTermMonths && <span className="field-error">{errors.loanTermMonths}</span>}
              </label>
            </div>
          </section>

          {requestError && <p className="alert alert-error" role="alert">{requestError}</p>}
          <div className="form-submit-row">
            <p><span className="required-mark">*</span> Semua nominal dalam Rupiah (IDR).</p>
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Menghitung..." : "Hitung skor & simpan"} <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>

        <ScorePreviewCard preview={preview} />
      </div>
    </main>
  );
}
