"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { BrandLogo } from "@/src/components/common/brand-logo";
import type {
  ApplicationRecord,
  ApplicationStatus,
  DashboardApplication,
  Profile,
  RiskTier,
  UserRole,
} from "@/src/types";

interface DashboardClientProps {
  profile: Profile;
  email: string;
  applications: DashboardApplication[];
}

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Menunggu tinjauan",
  approved: "Disetujui",
  declined: "Belum disetujui",
};
const riskLabels: Record<RiskTier, string> = {
  low: "Risiko rendah",
  moderate: "Risiko moderat",
  elevated: "Perlu perhatian",
  high: "Risiko tinggi",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase("id-ID"))
    .join("");
}

async function responseError(response: Response): Promise<string> {
  const payload: unknown = await response.json().catch(() => null);
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  return "Permintaan gagal. Silakan coba kembali.";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="score-badge" aria-label={`Skor kredit ${score}`}>
      {score}
    </span>
  );
}

export function DashboardClient({
  profile,
  email,
  applications: initialApplications,
}: DashboardClientProps) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [selected, setSelected] = useState<DashboardApplication | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ApplicationStatus>(
    "all",
  );
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const role: UserRole = profile.role;
  const evaluator = role === "evaluator";

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        application.applicant_name.toLocaleLowerCase("id-ID").includes(query) ||
        application.id.toLocaleLowerCase("id-ID").includes(query);
      return (
        matchesSearch &&
        (statusFilter === "all" || application.status === statusFilter)
      );
    });
  }, [applications, search, statusFilter]);

  const pendingCount = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const averageScore = applications.length
    ? Math.round(
        applications.reduce(
          (total, application) => total + application.credit_score,
          0,
        ) / applications.length,
      )
    : 0;
  const totalLoanValue = applications.reduce(
    (total, application) => total + application.loan_amount,
    0,
  );


// Distribusi kategori risiko kredit
const riskDistribution: {
  tier: RiskTier;
  label: string;
  count: number;
  percent: number;
}[] = (
  [
    { tier: "low", label: "Risiko rendah" },
    { tier: "moderate", label: "Risiko moderat" },
    { tier: "elevated", label: "Perlu perhatian" },
    { tier: "high", label: "Risiko tinggi" },
  ] as const
).map(({ tier, label }) => {
  const count = applications.filter(
    (application) => application.risk_tier === tier,
  ).length;

  return {
    tier,
    label,
    count,
    percent: applications.length
      ? (count / applications.length) * 100
      : 0,
  };
});

  async function reviewApplication(
    application: DashboardApplication,
    status: "approved" | "declined",
  ) {
    setActionError("");
    setBusyId(application.id);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error(await responseError(response));

      const updated: ApplicationRecord = {
        ...application,
        status,
        reviewed_at: new Date().toISOString(),
      };
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? { ...item, ...updated }
            : item,
        ),
      );
      setSelected((current) =>
        current?.id === application.id ? { ...current, ...updated } : current,
      );
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Keputusan gagal disimpan.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function signOut() {
    setSigningOut(true);
    const { error } = await createClient().auth.signOut({ scope: "local" });
    if (error) {
      setActionError("Keluar gagal. Silakan coba kembali.");
      setSigningOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand-lockup" href="/dashboard" aria-label="ZarPay dashboard">
          <BrandLogo />
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Navigasi utama">
          <Link className="side-nav-link active" href="/dashboard">
            <span className="nav-symbol" aria-hidden="true">⌂</span>
            Ringkasan
          </Link>
          {!evaluator && (
            <Link className="side-nav-link" href="/apply">
              <span className="nav-symbol" aria-hidden="true">＋</span>
              Ajukan pinjaman
            </Link>
          )}
          {evaluator && (
            <a className="side-nav-link" href="#applications">
              <span className="nav-symbol" aria-hidden="true">▤</span>
              Tinjauan pengajuan
              {pendingCount > 0 && (
                <span className="nav-count">{pendingCount}</span>
              )}
            </a>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-dot" />
            <strong>Skor transparan</strong>
            <p>Setiap penilaian disertai alasan dan faktor pembentuknya.</p>
          </div>
          <div className="profile-mini">
            <div className="avatar">{initials(profile.full_name || email)}</div>
            <div className="profile-copy">
              <strong>{profile.full_name}</strong>
              <span>{evaluator ? "Evaluator" : "Borrower"}</span>
            </div>
            <button
              className="icon-button"
              onClick={signOut}
              disabled={signingOut}
              aria-label="Keluar"
              title="Keluar"
              type="button"
            >
              ↗
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace <span>/</span> Ringkasan</p>
            <p className="topbar-date">
              {shortDate.format(new Date())}
            </p>
          </div>
          <div className="topbar-actions">
            <span className={`role-chip ${evaluator ? "role-evaluator" : ""}`}>
              <span className="status-dot" />
              {evaluator ? "Evaluator" : "Borrower"}
            </span>
            {!evaluator && (
              <Link className="button button-primary button-small" href="/apply">
                <span aria-hidden="true">＋</span> Pengajuan baru
              </Link>
            )}
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">{evaluator ? "PANEL EVALUATOR" : "DASHBOARD PEMINJAM"}</p>
            <h1>
              {evaluator
                ? `Selamat datang, ${profile.full_name.split(" ")[0]}`
                : `Halo, ${profile.full_name.split(" ")[0]}`}
            </h1>
            <p className="muted-copy">
              {evaluator
                ? "Pantau pengajuan dan tinjau profil risiko secara transparan."
                : "Pantau pengajuan dan pahami kesehatan kredit Anda."}
            </p>
          </div>
          <div className="demo-banner">
            <span className="demo-icon" aria-hidden="true">i</span>
            <span>Skor adalah simulasi akademik, bukan keputusan kredit aktual.</span>
          </div>
        </section>

        {actionError && (
          <p className="alert alert-error" role="alert">{actionError}</p>
        )}

        <section className="stats-grid" aria-label="Statistik pengajuan">
          <article className="stat-card stat-card-primary">
            <div className="stat-card-top">
              <span>Total pengajuan</span>
              <span className="stat-icon">▤</span>
            </div>
            <strong>{applications.length}</strong>
            <span className="stat-foot">
              {evaluator ? "Seluruh pengajuan terdaftar" : "Pengajuan Anda"}
            </span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Menunggu tinjauan</span>
              <span className="stat-icon stat-icon-warm">◷</span>
            </div>
            <strong>{pendingCount}</strong>
            <span className="stat-foot">
              {pendingCount ? "Perlu tindakan selanjutnya" : "Tidak ada yang tertunda"}
            </span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Rata-rata skor</span>
              <span className="stat-icon stat-icon-green">↗</span>
            </div>
            <strong>{averageScore || "—"}</strong>
            <span className="stat-foot">Rentang simulasi 300–850</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Total nilai pinjaman</span>
              <span className="stat-icon stat-icon-purple">◈</span>
            </div>
            <strong className="stat-currency">
              {currency.format(totalLoanValue)}
            </strong>
            <span className="stat-foot">Nilai pengajuan terkumpul</span>
          </article>
        </section>


        {/* DISTRIBUSI RISIKO KREDIT */}
        <section className="dashboard-insights">
          <div className="insight-card">
            <div className="insight-heading">
              <div>
                <p className="eyebrow">ANALISIS PORTOFOLIO</p>
                <h2>Distribusi profil risiko</h2>
                <p>
                  Gambaran kategori risiko dari seluruh pengajuan.
                </p>
              </div>
              <span className="insight-icon">◈</span>
            </div>

            <div className="risk-distribution">
              {riskDistribution.map((item) => (
                <div className="risk-item" key={item.tier}>
                  <div className="risk-item-heading">
                    <span className={`risk-label risk-label-${item.tier}`}>
                      <span className="risk-indicator" />
                      {item.label}
                    </span>
                    <strong>
                      {item.count}
                      <small>
                        {" "}({item.percent.toFixed(0)}%)
                      </small>
                    </strong>
                  </div>

                  <div
                    className="risk-track"
                    role="progressbar"
                    aria-label={`Persentase ${item.label}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(item.percent)}
                  >
                    <div
                      className={`risk-fill risk-fill-${item.tier}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="insight-note">
              <span>ⓘ</span>
              Kategori risiko dihitung berdasarkan hasil simulasi
              penilaian kredit ZarPay.
            </p>
          </div>

          <div className="insight-card insight-summary">
            <div className="insight-heading">
              <div>
                <p className="eyebrow">RINGKASAN AKTIVITAS</p>
                <h2>Status pengajuan</h2>
                <p>Ringkasan perkembangan pengajuan.</p>
              </div>
              <span className="insight-icon">▤</span>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <span className="activity-symbol activity-pending">
                  ◷
                </span>
                <div>
                  <strong>Menunggu tinjauan</strong>
                  <small>Masih dalam proses evaluasi</small>
                </div>
                <strong>{pendingCount}</strong>
              </div>

              <div className="activity-item">
                <span className="activity-symbol activity-approved">
                  ✓
                </span>
                <div>
                  <strong>Disetujui</strong>
                  <small>Pengajuan telah disetujui</small>
                </div>
                <strong>
                  {applications.filter(
                    (item) => item.status === "approved",
                  ).length}
                </strong>
              </div>

              <div className="activity-item">
                <span className="activity-symbol activity-declined">
                  ×
                </span>
                <div>
                  <strong>Belum disetujui</strong>
                  <small>Pengajuan tidak disetujui</small>
                </div>
                <strong>
                  {applications.filter(
                    (item) => item.status === "declined",
                  ).length}
                </strong>
              </div>
            </div>

            <div className="activity-total">
              <span>Total seluruh pengajuan</span>
              <strong>{applications.length}</strong>
            </div>
          </div>
        </section>

        <section className="content-card" id="applications">
          <div className="section-heading">
            <div>
              <h2>{evaluator ? "Pengajuan untuk ditinjau" : "Riwayat pengajuan"}</h2>
              <p>
                {evaluator
                  ? "Buka detail untuk melihat faktor skor dan memberi keputusan."
                  : "Pilih pengajuan untuk melihat rincian skor dan status."}
              </p>
            </div>
            <div className="table-controls">
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="Cari pengajuan"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari nama atau ID"
                  value={search}
                />
              </label>
              <select
                aria-label="Filter status"
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | ApplicationStatus)
                }
                value={statusFilter}
              >
                <option value="all">Semua status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="declined">Belum disetujui</option>
              </select>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">Z</div>
              <h3>{applications.length ? "Tidak ada hasil" : "Belum ada pengajuan"}</h3>
              <p>
                {applications.length
                  ? "Coba ubah kata pencarian atau filter status."
                  : evaluator
                    ? "Pengajuan baru akan muncul di sini."
                    : "Mulai dengan mengisi profil pinjaman Anda."}
              </p>
              {!evaluator && applications.length === 0 && (
                <Link className="button button-primary" href="/apply">
                  Buat pengajuan pertama
                </Link>
              )}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="application-table">
                <thead>
                  <tr>
                    <th>Peminjam</th>
                    <th>Jumlah pinjaman</th>
                    <th>Skor kredit</th>
                    <th>Rasio DTI</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th><span className="sr-only">Detail</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="applicant-cell">
                          <span className="avatar avatar-small">
                            {initials(application.applicant_name)}
                          </span>
                          <span>
                            <strong>{application.applicant_name}</strong>
                            <small>#{application.id.slice(0, 8).toUpperCase()}</small>
                          </span>
                        </div>
                      </td>
                      <td>{currency.format(application.loan_amount)}</td>
                      <td><ScoreBadge score={application.credit_score} /></td>
                      <td>{(application.dti_ratio * 100).toFixed(1)}%</td>
                      <td>
                        <span className={`status-pill status-${application.status}`}>
                          <span className="status-dot" />
                          {statusLabels[application.status]}
                        </span>
                      </td>
                      <td>{shortDate.format(new Date(application.created_at))}</td>
                      <td>
                        <button
                          className="table-link"
                          onClick={() => setSelected(application)}
                          type="button"
                        >
                          Detail <span aria-hidden="true">→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <footer className="page-footer">
          <span>ZarPay © {new Date().getFullYear()}</span>
          <span>Penilaian berbasis aturan simulasi</span>
        </footer>
      </main>

      {selected && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section
            aria-labelledby="detail-title"
            aria-modal="true"
            className="detail-modal"
            role="dialog"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">RINCIAN PENILAIAN</p>
                <h2 id="detail-title">{selected.applicant_name}</h2>
                <span className="modal-reference">
                  ID #{selected.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <button
                className="icon-button modal-close"
                onClick={() => setSelected(null)}
                aria-label="Tutup detail"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="score-summary">
              <div className="score-ring">
                <strong>{selected.credit_score}</strong>
                <span>SKOR</span>
              </div>
              <div>
                <span className={`risk-pill risk-${selected.risk_tier}`}>
                  {riskLabels[selected.risk_tier]}
                </span>
                <p>Rentang penilaian ZarPay: 300–850</p>
              </div>
            </div>
            <div className="detail-metrics">
              <div><span>Pinjaman</span><strong>{currency.format(selected.loan_amount)}</strong></div>
              <div><span>Estimasi cicilan / bln</span><strong>{currency.format(selected.estimated_payment)}</strong></div>
              <div><span>DTI pascapinjaman</span><strong>{(selected.dti_ratio * 100).toFixed(1)}%</strong></div>
              <div><span>Tenor</span><strong>{selected.loan_term_months} bulan</strong></div>
            </div>
            <div className="factor-heading">
              <h3>Faktor pembentuk skor</h3>
              <span>Simulasi berbasis aturan</span>
            </div>
            <ul className="factor-list">
              {selected.score_factors.map((factor) => (
                <li key={factor.label}>
                  <span className="factor-check" aria-hidden="true">✓</span>
                  <span className="factor-copy">
                    <strong>{factor.label}</strong>
                    <small>{factor.explanation}</small>
                  </span>
                  <span className="factor-points">{factor.points}<small>/{factor.maximum}</small></span>
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <span className={`status-pill status-${selected.status}`}>
                <span className="status-dot" /> {statusLabels[selected.status]}
              </span>
              {evaluator && selected.status === "pending" && (
                <div className="review-actions">
                  <button
                    className="button button-quiet"
                    disabled={busyId === selected.id}
                    onClick={() => reviewApplication(selected, "declined")}
                    type="button"
                  >
                    Tidak disetujui
                  </button>
                  <button
                    className="button button-primary"
                    disabled={busyId === selected.id}
                    onClick={() => reviewApplication(selected, "approved")}
                    type="button"
                  >
                    {busyId === selected.id ? "Menyimpan..." : "Setujui"}
                  </button>
                </div>
              )}
            </div>
            <p className="disclaimer">
              Hasil ini merupakan simulasi untuk keperluan akademik. Keputusan
              tidak menggantikan pemeriksaan kredit atau nasihat keuangan.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
