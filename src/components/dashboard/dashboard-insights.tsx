import type { ApplicationStatus, DashboardApplication, RiskTier } from "@/src/types";

type InsightApplication = Pick<DashboardApplication, "risk_tier" | "status">;

const riskTiers: Array<{ tier: RiskTier; label: string }> = [
  { tier: "low", label: "Risiko rendah" },
  { tier: "moderate", label: "Risiko moderat" },
  { tier: "elevated", label: "Perlu perhatian" },
  { tier: "high", label: "Risiko tinggi" },
];

export interface DashboardInsightSummary {
  riskDistribution: Array<{
    tier: RiskTier;
    label: string;
    count: number;
    percent: number;
  }>;
  statusCounts: Record<ApplicationStatus, number>;
  total: number;
}

export function summarizeDashboardPage(
  applications: InsightApplication[],
): DashboardInsightSummary {
  const total = applications.length;
  const statusCounts: Record<ApplicationStatus, number> = {
    pending: 0,
    approved: 0,
    declined: 0,
  };

  for (const application of applications) {
    statusCounts[application.status] += 1;
  }

  return {
    total,
    statusCounts,
    riskDistribution: riskTiers.map(({ tier, label }) => {
      const count = applications.filter(
        (application) => application.risk_tier === tier,
      ).length;

      return {
        tier,
        label,
        count,
        percent: total ? (count / total) * 100 : 0,
      };
    }),
  };
}

interface DashboardInsightsProps {
  applications: DashboardApplication[];
  page: number;
}

export function DashboardInsights({
  applications,
  page,
}: DashboardInsightsProps) {
  if (!applications.length) return null;

  const summary = summarizeDashboardPage(applications);

  return (
    <section className="dashboard-insights" aria-label="Ringkasan hasil halaman ini">
      <article className="insight-card">
        <div className="insight-heading">
          <div>
            <p className="eyebrow">RINGKASAN HALAMAN</p>
            <h2>Distribusi profil risiko</h2>
            <p>
              Dari {summary.total} pengajuan yang ditampilkan pada halaman {page}.
            </p>
          </div>
          <span className="insight-icon" aria-hidden="true">◈</span>
        </div>

        <div className="risk-distribution">
          {summary.riskDistribution.map((item) => (
            <div className="risk-item" key={item.tier}>
              <div className="risk-item-heading">
                <span className={`risk-label risk-label-${item.tier}`}>
                  <span className="risk-indicator" />
                  {item.label}
                </span>
                <strong>
                  {item.count}
                  <small> ({item.percent.toFixed(0)}%)</small>
                </strong>
              </div>
              <div
                className="risk-track"
                role="progressbar"
                aria-label={`Proporsi ${item.label} pada halaman ${page}`}
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
          Distribusi hanya mencakup hasil pada halaman ini, mengikuti pencarian
          dan filter yang sedang aktif.
        </p>
      </article>

      <article className="insight-card insight-summary">
        <div className="insight-heading">
          <div>
            <p className="eyebrow">RINGKASAN AKTIVITAS</p>
            <h2>Status pengajuan</h2>
            <p>Rekap status dari pengajuan yang sedang ditampilkan.</p>
          </div>
          <span className="insight-icon" aria-hidden="true">▤</span>
        </div>

        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-symbol activity-pending" aria-hidden="true">◷</span>
            <div>
              <strong>Menunggu tinjauan</strong>
              <small>Masih dalam proses evaluasi</small>
            </div>
            <strong>{summary.statusCounts.pending}</strong>
          </div>
          <div className="activity-item">
            <span className="activity-symbol activity-approved" aria-hidden="true">✓</span>
            <div>
              <strong>Disetujui</strong>
              <small>Pengajuan telah disetujui</small>
            </div>
            <strong>{summary.statusCounts.approved}</strong>
          </div>
          <div className="activity-item">
            <span className="activity-symbol activity-declined" aria-hidden="true">×</span>
            <div>
              <strong>Belum disetujui</strong>
              <small>Pengajuan tidak disetujui</small>
            </div>
            <strong>{summary.statusCounts.declined}</strong>
          </div>
        </div>

        <div className="activity-total">
          <span>Pengajuan pada halaman ini</span>
          <strong>{summary.total}</strong>
        </div>
      </article>
    </section>
  );
}
