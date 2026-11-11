import Link from "next/link";
import { BrandLogo } from "@/src/components/common/brand-logo";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import {
  currencyFormat,
  dashboardDateTimeFormat,
  initials,
  riskLabels,
  statusLabels,
} from "@/src/components/dashboard/dashboard-utils";
import {
  analyzeEvaluatorReviews,
  type EvaluatorReviewSample,
} from "@/src/lib/evaluator-review-analytics";
import type { Profile, RiskTier } from "@/src/types";

export interface EvaluatorReviewRecord extends EvaluatorReviewSample {
  id: string;
  applicant_name: string;
  loan_amount: number;
  credit_score: number;
  review_note: string | null;
}

interface EvaluatorProfileOverviewProps {
  profile: Profile;
  email: string;
  reviewedCount: number;
  approvedCount: number;
  declinedCount: number;
  pendingQueueCount: number;
  recentReviews: EvaluatorReviewRecord[];
}

const riskTiers: RiskTier[] = ["low", "moderate", "elevated", "high"];

function averageDurationLabel(hours: number | null): string {
  if (hours === null) return "Belum cukup data";
  if (hours < 24) return `${hours.toFixed(1)} jam`;
  return `${(hours / 24).toFixed(1)} hari`;
}

export function EvaluatorProfileOverview({
  profile,
  email,
  reviewedCount,
  approvedCount,
  declinedCount,
  pendingQueueCount,
  recentReviews,
}: EvaluatorProfileOverviewProps) {
  const analysis = analyzeEvaluatorReviews(recentReviews);
  const approvalPercent = reviewedCount
    ? (approvedCount / reviewedCount) * 100
    : 0;
  const declinePercent = reviewedCount
    ? (declinedCount / reviewedCount) * 100
    : 0;
  const sampleTotal = analysis.sampleCount || 1;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/" aria-label="ZarPay beranda">
          <BrandLogo />
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Navigasi evaluator">
          <Link className="side-nav-link" href="/dashboard">
            <span className="nav-symbol" aria-hidden="true">⌂</span>
            Tinjauan pengajuan
          </Link>
          <Link
            aria-current="page"
            className="side-nav-link active"
            href="/evaluator/profile"
          >
            <span className="nav-symbol" aria-hidden="true">◎</span>
            Profil evaluator
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{initials(profile.full_name || email)}</div>
            <div className="profile-copy">
              <strong>{profile.full_name}</strong>
              <span>Evaluator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace <span>/</span> Profil evaluator
            </p>
            <p className="topbar-date">Aktivitas dan analisis tinjauan</p>
          </div>
          <div className="topbar-actions">
            <span className="role-chip role-evaluator">
              <span className="status-dot" />
              Evaluator
            </span>
            <SignOutButton className="button button-quiet button-small" />
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">PROFIL KHUSUS EVALUATOR</p>
            <h1>Aktivitas dan analisis tinjauan</h1>
            <p className="muted-copy">
              Ringkasan keputusan yang tercatat oleh akun ini dan tinjauan
              terbaru.
            </p>
            <Link
              className="button button-primary button-small evaluator-profile-cta"
              href="/dashboard"
            >
              Buka antrian tinjauan
            </Link>
          </div>
          <div className="demo-banner">
            <span aria-hidden="true" className="demo-icon">i</span>
            Seluruh keputusan dan analitik di ZarPay adalah simulasi akademik.
          </div>
        </section>

        <section className="profile-identity-card" aria-label="Identitas evaluator">
          <div className="avatar profile-avatar-large">
            {initials(profile.full_name || email)}
          </div>
          <div className="profile-identity-copy">
            <span className="profile-section-kicker">AKUN EVALUATOR AKTIF</span>
            <h2>{profile.full_name || "Evaluator ZarPay"}</h2>
            <p>{email || "Email tidak tersedia"}</p>
          </div>
          <div className="profile-identity-meta">
            <span>Peran</span>
            <strong>Evaluator</strong>
          </div>
        </section>

        <section className="stats-grid" aria-label="Statistik tinjauan evaluator">
          <article className="stat-card stat-card-primary">
            <div className="stat-card-top">
              <span>Keputusan tercatat</span>
              <span className="stat-icon">▤</span>
            </div>
            <strong>{reviewedCount}</strong>
            <span className="stat-foot">Keputusan oleh akun ini</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Disetujui simulasi</span>
              <span className="stat-icon stat-icon-green">✓</span>
            </div>
            <strong>{approvedCount}</strong>
            <span className="stat-foot">Termasuk dalam keputusan tercatat</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Tidak disetujui simulasi</span>
              <span className="stat-icon stat-icon-warm">×</span>
            </div>
            <strong>{declinedCount}</strong>
            <span className="stat-foot">Termasuk dalam keputusan tercatat</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Antrian global</span>
              <span className="stat-icon stat-icon-purple">◷</span>
            </div>
            <strong>{pendingQueueCount}</strong>
            <span className="stat-foot">Menunggu tinjauan semua evaluator</span>
          </article>
        </section>

        <section
          aria-label="Analisis aktivitas evaluator"
          className="evaluator-analysis-grid"
        >
          <article className="insight-card evaluator-analysis-card">
            <div className="insight-heading">
              <div>
                <p className="eyebrow">SELURUH KEPUTUSAN TERCATAT</p>
                <h2>Komposisi hasil tinjauan</h2>
                <p>Hitungan akurat berdasarkan keputusan akun ini.</p>
              </div>
              <span aria-hidden="true" className="insight-icon">◈</span>
            </div>
            <div
              aria-label={`${approvedCount} disetujui simulasi, ${declinedCount} tidak disetujui simulasi`}
              className="evaluator-outcome-track"
              role="img"
            >
              <span
                className="evaluator-outcome-approved"
                style={{ width: `${approvalPercent}%` }}
              />
              <span
                className="evaluator-outcome-declined"
                style={{ width: `${declinePercent}%` }}
              />
            </div>
            <div className="evaluator-analysis-legend">
              <span>
                <i className="evaluator-outcome-approved" />
                Disetujui <strong>{approvedCount}</strong>
              </span>
              <span>
                <i className="evaluator-outcome-declined" />
                Tidak disetujui <strong>{declinedCount}</strong>
              </span>
            </div>
            <p className="insight-note">
              Proporsi ini hanya deskripsi riwayat akun, bukan target atau
              ukuran kualitas keputusan.
            </p>
          </article>

          <article className="insight-card evaluator-analysis-card">
            <div className="insight-heading">
              <div>
                <p className="eyebrow">10 TINJAUAN TERBARU</p>
                <h2>Distribusi profil risiko</h2>
                <p>
                  Sampel berisi {analysis.sampleCount} keputusan terbaru yang
                  tersedia.
                </p>
              </div>
              <span aria-hidden="true" className="insight-icon">⌁</span>
            </div>
            <div className="risk-distribution">
              {riskTiers.map((tier) => {
                const count = analysis.riskCounts[tier];
                const percent = (count / sampleTotal) * 100;
                return (
                  <div className="risk-item" key={tier}>
                    <div className="risk-item-heading">
                      <span className={`risk-label risk-label-${tier}`}>
                        <span className="risk-indicator" />
                        {riskLabels[tier]}
                      </span>
                      <strong>
                        {count}
                        <small> ({percent.toFixed(0)}%)</small>
                      </strong>
                    </div>
                    <div
                      aria-label={`${riskLabels[tier]}: ${count} dari ${analysis.sampleCount}`}
                      className="risk-track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={Math.max(analysis.sampleCount, 1)}
                      aria-valuenow={count}
                    >
                      <div
                        className={`risk-fill risk-fill-${tier}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="insight-note">
              Distribusi ini hanya mencakup sepuluh tinjauan terbaru, bukan
              seluruh portofolio.
            </p>
          </article>

          <article className="insight-card evaluator-analysis-card evaluator-turnaround-card">
            <div className="insight-heading">
              <div>
                <p className="eyebrow">WAKTU TINJAUAN</p>
                <h2>Rata-rata durasi</h2>
                <p>Dari pengajuan dibuat hingga keputusan dicatat.</p>
              </div>
              <span aria-hidden="true" className="insight-icon">◷</span>
            </div>
            <strong className="evaluator-turnaround-value">
              {averageDurationLabel(analysis.averageTurnaroundHours)}
            </strong>
            <p className="insight-note">
              Dihitung dari {analysis.timedReviewCount} tinjauan terbaru dengan
              waktu yang valid. Ini metrik deskriptif, bukan SLA atau target.
            </p>
          </article>
        </section>

        <section className="content-card evaluator-review-history">
          <div className="section-heading evaluator-review-heading">
            <div>
              <p className="eyebrow">AUDIT AKTIVITAS</p>
              <h2>Keputusan terbaru</h2>
              <p>
                Menampilkan {recentReviews.length} keputusan terbaru dari{" "}
                {reviewedCount} keputusan yang tercatat.
              </p>
            </div>
            <Link
              className="button button-quiet button-small"
              href="/dashboard?status=all"
            >
              Buka semua pengajuan
            </Link>
          </div>
          {recentReviews.length ? (
            <div className="table-wrap">
              <table className="application-table">
                <thead>
                  <tr>
                    <th>Peminjam / ID</th>
                    <th>Nominal</th>
                    <th>Skor / risiko</th>
                    <th>Keputusan</th>
                    <th>Waktu tinjauan</th>
                    <th>Catatan evaluator</th>
                    <th><span className="sr-only">Detail</span></th>
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div className="evaluator-review-applicant">
                          <strong>{review.applicant_name}</strong>
                          <small>#{review.id.slice(0, 8).toUpperCase()}</small>
                        </div>
                      </td>
                      <td>{currencyFormat.format(review.loan_amount)}</td>
                      <td>
                        <div className="evaluator-review-score">
                          <strong>{review.credit_score}</strong>
                          <span className={`risk-pill risk-${review.risk_tier}`}>
                            {riskLabels[review.risk_tier]}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill status-${review.status}`}>
                          <span className="status-dot" />
                          {statusLabels[review.status]}
                        </span>
                      </td>
                      <td>
                        {review.reviewed_at
                          ? dashboardDateTimeFormat.format(
                              new Date(review.reviewed_at),
                            )
                          : "Waktu tidak tersedia"}
                      </td>
                      <td>
                        <span
                          className="evaluator-review-note"
                          title={review.review_note ?? "Catatan tidak tersedia"}
                        >
                          {review.review_note ?? "Catatan tidak tersedia"}
                        </span>
                      </td>
                      <td>
                        <Link
                          className="table-link"
                          href={`/dashboard?status=${review.status}&q=${encodeURIComponent(review.id)}`}
                        >
                          Buka <span aria-hidden="true">→</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state evaluator-review-empty">
              <div aria-hidden="true" className="empty-illustration">Z</div>
              <h3>Belum ada keputusan tercatat</h3>
              <p>
                Setelah meninjau pengajuan yang menunggu, riwayat keputusan
                akun ini akan muncul di sini.
              </p>
              <Link className="button button-primary" href="/dashboard">
                Buka antrian tinjauan
              </Link>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>ZarPay © {new Date().getFullYear()}</span>
          <span>Analitik berdasarkan keputusan simulasi yang tercatat.</span>
        </footer>
      </main>
    </div>
  );
}
