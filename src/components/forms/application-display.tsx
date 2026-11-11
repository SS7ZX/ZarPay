import Link from "next/link";
import type { ScoringResult } from "@/src/types";

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

interface ApplicationResultProps {
  applicationId: string;
  onCreateAnother: () => void;
  result: ScoringResult;
}

interface ScorePreviewProps {
  preview: ScoringResult | null;
}

export function ApplicationResult({
  applicationId,
  onCreateAnother,
  result,
}: ApplicationResultProps) {
  const riskLabel =
    result.riskTier === "low"
      ? "Risiko rendah"
      : result.riskTier === "moderate"
        ? "Risiko moderat"
        : result.riskTier === "elevated"
          ? "Perlu perhatian"
          : "Risiko tinggi";

  return (
    <div className="result-screen">
      <section className="result-card">
        <div className="result-check" aria-hidden="true">✓</div>
        <p className="eyebrow">PENGAJUAN TERSIMPAN</p>
        <h1>Penilaian simulasi Anda siap</h1>
        <p className="muted-copy">
          Referensi #{applicationId.slice(0, 8).toUpperCase()} · Data tersimpan
          pada akun Anda.
        </p>
        <div className="result-score">
          <strong>{result.creditScore}</strong>
          <span>SKOR KREDIT</span>
        </div>
        <div className="result-summary-grid">
          <div>
            <span>Kategori risiko</span>
            <strong className={`risk-pill risk-${result.riskTier}`}>
              {riskLabel}
            </strong>
          </div>
          <div>
            <span>Rasio DTI</span>
            <strong>{(result.dtiRatio * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>Estimasi cicilan / bulan</span>
            <strong>{currencyFormat.format(result.estimatedPayment)}</strong>
          </div>
        </div>
        <p className="disclaimer">
          Simulasi menggunakan estimasi bunga 12% per tahun dan aturan contoh.
          Ini bukan penawaran, persetujuan, atau keputusan kredit nyata.
        </p>
        <div className="result-actions">
          <Link className="button button-primary" href="/dashboard">
            Lihat dashboard
          </Link>
          <button
            className="button button-quiet"
            onClick={onCreateAnother}
            type="button"
          >
            Buat simulasi lain
          </button>
        </div>
      </section>
    </div>
  );
}

export function ScorePreviewCard({ preview }: ScorePreviewProps) {
  const riskLabel =
    preview?.riskTier === "low"
      ? "Risiko rendah"
      : preview?.riskTier === "moderate"
        ? "Risiko moderat"
        : preview?.riskTier === "elevated"
          ? "Perlu perhatian"
          : preview
            ? "Risiko tinggi"
            : "";

  return (
    <aside className="score-preview-card">
      <div className="preview-heading">
        <span>PRATINJAU</span><span className="live-dot" /> langsung
      </div>
      {preview ? (
        <>
          <div className="preview-score">
            <div><strong>{preview.creditScore}</strong><span>SIMULASI SKOR</span></div>
            <span className={`risk-pill risk-${preview.riskTier}`}>
              {riskLabel}
            </span>
          </div>
          <div className="score-scale">
            <span
              style={{
                width: `${((preview.creditScore - 300) / 550) * 100}%`,
              }}
            />
            <i
              style={{
                left: `${((preview.creditScore - 300) / 550) * 100}%`,
              }}
            />
          </div>
          <div className="scale-labels"><span>300</span><span>850</span></div>
          <div className="preview-detail">
            <div><span>DTI pascapinjaman</span><strong>{(preview.dtiRatio * 100).toFixed(1)}%</strong></div>
            <div><span>Perkiraan cicilan</span><strong>{currencyFormat.format(preview.estimatedPayment)}</strong></div>
          </div>
          <div className="preview-info">
            <strong>Bagaimana skor dihitung?</strong>
            <p>Skor 300–850 memperhitungkan DTI, pendapatan, stabilitas kerja, riwayat kredit, ukuran pinjaman, dan tunggakan.</p>
          </div>
        </>
      ) : (
        <div className="preview-empty">
          <div className="preview-placeholder">···</div>
          <strong>Skor akan muncul di sini</strong>
          <p>Lengkapi pendapatan, utang, dan rencana pinjaman untuk melihat pratinjau.</p>
        </div>
      )}
      <p className="preview-disclaimer">
        <span aria-hidden="true">i</span>
        Simulasi akademik saja. Bukan penawaran atau keputusan pinjaman.
      </p>
    </aside>
  );
}
