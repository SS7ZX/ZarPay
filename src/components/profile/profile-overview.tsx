import Link from "next/link";
import type {
  ApplicationInput,
  ApplicationStatus,
  Profile,
  RiskTier,
  ScoreFactor,
  ScoringResult,
} from "@/src/types";
import { calculateScore } from "@/src/lib/scoringEngine";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { ApplicationDecisionCard } from "@/src/components/common/application-decision-card";
import { BrandLogo } from "@/src/components/common/brand-logo";
import {
  currencyFormat,
  dashboardDateFormat,
  riskLabels,
  statusLabels,
} from "@/src/components/dashboard/dashboard-utils";

export interface ProfileApplication {
  id: string;
  loan_amount: number;
  loan_term_months: number;
  estimated_payment: number;
  dti_ratio: number;
  credit_score: number;
  risk_tier: RiskTier;
  score_factors: ScoreFactor[];
  status: ApplicationStatus;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

interface ProfileOverviewProps {
  profile: Profile;
  email: string;
  applications: ProfileApplication[];
  totalApplications: number;
}

const demoInput: ApplicationInput = {
  monthlyIncome: 15_000_000,
  monthlyDebt: 2_000_000,
  loanAmount: 50_000_000,
  loanTermMonths: 24,
  employmentYears: 3,
  creditHistoryYears: 4,
  recentDefaults: false,
};

const demoAnalysis = calculateScore(demoInput);

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function AnalysisPanel({
  analysis,
  loanAmount,
  loanTermMonths,
  factors,
  demo,
}: {
  analysis: ScoringResult;
  loanAmount: number;
  loanTermMonths: number;
  factors: ScoreFactor[];
  demo: boolean;
}) {
  return (
    <>
      {demo && (
        <div className="profile-demo-notice" role="note">
          Ini contoh data dummy untuk melihat bentuk analisis. Data ini tidak
          tersimpan dan bukan hasil penilaian akun Anda.
        </div>
      )}
      <div className="profile-analysis-grid">
        <article className="profile-analysis-score">
          <div className="profile-score-heading">
            <div>
              <span className="profile-section-kicker">SKOR SIMULASI</span>
              <strong>{analysis.creditScore}</strong>
            </div>
            <span className={`risk-pill risk-${analysis.riskTier}`}>
              {riskLabels[analysis.riskTier]}
            </span>
          </div>
          <div
            className="profile-score-track"
            role="progressbar"
            aria-label="Skor simulasi"
            aria-valuemin={300}
            aria-valuemax={850}
            aria-valuenow={analysis.creditScore}
          >
            <span
              style={{
                width: `${((analysis.creditScore - 300) / 550) * 100}%`,
              }}
            />
          </div>
          <p>
            Skor hanya menggambarkan aturan simulasi ZarPay, bukan keputusan
            kredit atau rekomendasi keuangan.
          </p>
        </article>
        <article className="profile-analysis-metric">
          <span>DTI setelah estimasi cicilan</span>
          <strong>{(analysis.dtiRatio * 100).toFixed(1)}%</strong>
          <small>Estimasi kemampuan bayar dalam skenario ini</small>
        </article>
        <article className="profile-analysis-metric">
          <span>Estimasi cicilan per bulan</span>
          <strong>{currencyFormat.format(analysis.estimatedPayment)}</strong>
          <small>Asumsi bunga simulasi 12% per tahun</small>
        </article>
        <article className="profile-analysis-metric">
          <span>Nominal dan tenor</span>
          <strong>{currencyFormat.format(loanAmount)}</strong>
          <small>{loanTermMonths} bulan</small>
        </article>
      </div>

      <section className="profile-factor-panel" aria-labelledby="profile-factors-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-section-kicker">RINCIAN PENILAIAN</span>
            <h3 id="profile-factors-title">Faktor pembentuk skor</h3>
          </div>
          <span>{factors.length} faktor</span>
        </div>
        <div className="profile-factor-list">
          {factors.map((factor) => (
            <article className="profile-factor" key={factor.label}>
              <div className="profile-factor-copy">
                <strong>{factor.label}</strong>
                <span>{factor.explanation}</span>
              </div>
              <div className="profile-factor-points">
                <strong>{factor.points}<small>/{factor.maximum}</small></strong>
                <progress
                  aria-label={`${factor.label}: ${factor.points} dari ${factor.maximum} poin`}
                  max={factor.maximum}
                  value={factor.points}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function ProfileOverview({
  profile,
  email,
  applications,
  totalApplications,
}: ProfileOverviewProps) {
  const latest = applications[0];
  const demo = !latest;
  const analysis: ScoringResult = latest
    ? {
        creditScore: latest.credit_score,
        dtiRatio: latest.dti_ratio,
        estimatedPayment: latest.estimated_payment,
        riskTier: latest.risk_tier,
        scoreFactors: latest.score_factors,
      }
    : demoAnalysis;
  const factors = latest?.score_factors ?? demoAnalysis.scoreFactors;
  const loanAmount = latest?.loan_amount ?? demoInput.loanAmount;
  const loanTermMonths = latest?.loan_term_months ?? demoInput.loanTermMonths;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/" aria-label="ZarPay beranda">
          <BrandLogo />
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Navigasi akun">
          <Link className="side-nav-link" href="/dashboard">
            <span className="nav-symbol" aria-hidden="true">⌂</span>
            {profile.role === "evaluator" ? "Tinjauan pengajuan" : "Dashboard"}
          </Link>
          {profile.role === "borrower" && (
            <Link className="side-nav-link" href="/apply">
              <span className="nav-symbol" aria-hidden="true">＋</span>
              Ajukan pinjaman
            </Link>
          )}
          <Link className="side-nav-link active" href="/profile" aria-current="page">
            <span className="nav-symbol" aria-hidden="true">◎</span>
            Profil saya
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar">{initials(profile.full_name || email)}</div>
            <div className="profile-copy">
              <strong>{profile.full_name}</strong>
              <span>{profile.role === "evaluator" ? "Evaluator" : "Peminjam"}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace <span>/</span> Profil</p>
            <p className="topbar-date">Informasi akun dan analisis simulasi</p>
          </div>
          <div className="topbar-actions">
            <span className={`role-chip ${profile.role === "evaluator" ? "role-evaluator" : ""}`}>
              <span className="status-dot" />
              {profile.role === "evaluator" ? "Evaluator" : "Peminjam"}
            </span>
            <SignOutButton className="button button-quiet button-small" />
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">PROFIL AKUN</p>
            <h1>Profil dan analisis</h1>
            <p className="muted-copy">
              Informasi akun dan ringkasan hasil pengajuan yang tersimpan.
            </p>
          </div>
          <div className="demo-banner">
            <span className="demo-icon" aria-hidden="true">i</span>
            Analisis ini bersifat simulasi akademik dan bukan keputusan pinjaman.
          </div>
        </section>

        <section className="profile-identity-card" aria-label="Informasi akun">
          <div className="avatar profile-avatar-large">
            {initials(profile.full_name || email)}
          </div>
          <div className="profile-identity-copy">
            <span className="profile-section-kicker">AKUN AKTIF</span>
            <h2>{profile.full_name || "Pengguna ZarPay"}</h2>
            <p>{email || "Email tidak tersedia"}</p>
          </div>
          <div className="profile-identity-meta">
            <span>Peran</span>
            <strong>{profile.role === "evaluator" ? "Evaluator" : "Peminjam"}</strong>
          </div>
        </section>

        {profile.role === "evaluator" && (
          <div className="profile-evaluator-callout">
            <div>
              <strong>Akun evaluator</strong>
              <p>
                Tinjau semua pengajuan dari dashboard evaluator. Contoh analisis
                di bawah hanya demonstrasi, bukan data peminjam.
              </p>
            </div>
            <Link className="button button-primary button-small" href="/dashboard">
              Buka tinjauan
            </Link>
          </div>
        )}

        <section className="profile-summary-grid" aria-label="Ringkasan profil">
          <article className="stat-card stat-card-primary">
            <div className="stat-card-top"><span>Total pengajuan tersimpan</span><span className="stat-icon">▤</span></div>
            <strong>{totalApplications}</strong>
            <span className="stat-foot">Milik akun ini</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top"><span>Skor terbaru</span><span className="stat-icon stat-icon-green">↗</span></div>
            <strong>{latest?.credit_score ?? "—"}</strong>
            <span className="stat-foot">{latest ? "Dari pengajuan terakhir" : "Belum ada hasil akun"}</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top"><span>Risiko simulasi</span><span className="stat-icon stat-icon-purple">◈</span></div>
            <strong className="profile-summary-risk">
              {latest ? riskLabels[latest.risk_tier] : "Belum ada"}
            </strong>
            <span className="stat-foot">Berdasarkan skor terakhir</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top"><span>Status terakhir</span><span className="stat-icon stat-icon-warm">◷</span></div>
            <strong className="profile-summary-risk">
              {latest ? statusLabels[latest.status] : "Belum ada"}
            </strong>
            <span className="stat-foot">Status pengajuan terbaru</span>
          </article>
        </section>

        {latest && latest.status !== "pending" && (
          <ApplicationDecisionCard application={latest} />
        )}

        <section className="content-card profile-analysis-card">
          <div className="profile-section-heading profile-analysis-heading">
            <div>
              <span className="profile-section-kicker">
                {demo ? "CONTOH ANALISIS" : "ANALISIS PENGAJUAN TERAKHIR"}
              </span>
              <h2>{demo ? "Pratinjau analisis mendalam" : "Rincian hasil simulasi"}</h2>
              <p>
                {latest
                  ? `Diajukan ${dashboardDateFormat.format(new Date(latest.created_at))}.`
                  : "Belum ada pengajuan tersimpan untuk akun ini."}
              </p>
            </div>
            {profile.role === "borrower" && (
              <Link className="button button-primary button-small" href="/apply">
                Buat simulasi
              </Link>
            )}
          </div>
          <AnalysisPanel
            analysis={analysis}
            demo={demo}
            factors={factors}
            loanAmount={loanAmount}
            loanTermMonths={loanTermMonths}
          />
        </section>

        <section className="content-card profile-history-card">
          <div className="profile-section-heading">
            <div>
              <span className="profile-section-kicker">RIWAYAT</span>
              <h2>Pengajuan terbaru</h2>
            </div>
            <span className="profile-history-count">
              Menampilkan {applications.length} dari {totalApplications}
            </span>
          </div>
          {applications.length ? (
            <div className="profile-history-list">
              {applications.map((application) => (
                <article className="profile-history-row" key={application.id}>
                  <div>
                    <strong>{currencyFormat.format(application.loan_amount)}</strong>
                    <span>
                      {dashboardDateFormat.format(new Date(application.created_at))}
                      {" · "}Skor {application.credit_score}
                    </span>
                  </div>
                  <span className={`status-pill status-${application.status}`}>
                    <span className="status-dot" />
                    {statusLabels[application.status]}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="profile-empty-state">
              <h3>Belum ada riwayat pengajuan</h3>
              <p>
                Contoh analisis di atas hanya dummy dan tidak dihitung sebagai
                pengajuan. Buat simulasi untuk menyimpan hasil pada akun ini.
              </p>
              {profile.role === "borrower" && (
                <Link className="button button-quiet button-small" href="/apply">
                  Mulai pengajuan
                </Link>
              )}
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>ZarPay © {new Date().getFullYear()}</span>
          <span>Data dummy ditandai dan tidak disimpan.</span>
        </footer>
      </main>
    </div>
  );
}
