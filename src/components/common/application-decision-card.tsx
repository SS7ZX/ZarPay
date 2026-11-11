import type { ApplicationRecord } from "@/src/types";
import {
  currencyFormat,
  dashboardDateTimeFormat,
  statusLabels,
} from "@/src/components/dashboard/dashboard-utils";

interface ApplicationDecisionCardProps {
  application: Pick<
    ApplicationRecord,
    "id" | "loan_amount" | "status" | "reviewed_at" | "review_note"
  >;
  onViewDetails?: () => void;
}

export function ApplicationDecisionCard({
  application,
  onViewDetails,
}: ApplicationDecisionCardProps) {
  if (application.status === "pending") return null;
  const approved = application.status === "approved";

  return (
    <section
      aria-label="Hasil tinjauan pengajuan"
      className={`application-outcome application-outcome-${application.status}`}
    >
      <div aria-hidden="true" className="application-outcome-icon">
        {approved ? "✓" : "!"}
      </div>
      <div className="application-outcome-content">
        <div className="application-outcome-heading">
          <div>
            <p className="eyebrow">HASIL TINJAUAN SIMULASI</p>
            <h2>
              {approved
                ? "Pengajuan disetujui dalam simulasi"
                : "Pengajuan belum disetujui dalam simulasi"}
            </h2>
          </div>
          <span className={`status-pill status-${application.status}`}>
            <span className="status-dot" />
            {statusLabels[application.status]}
          </span>
        </div>
        <p className="application-outcome-description">
          {approved
            ? "Hasil ini hanya berlaku untuk simulasi akademik. Ini bukan kontrak atau pinjaman aktif, tidak menjamin persetujuan lembaga keuangan, dan tidak mencairkan dana."
            : "Hasil ini hanya berlaku untuk simulasi akademik, bukan keputusan lembaga keuangan. Tinjau catatan evaluator dan periksa kembali data sebelum membuat simulasi baru."}
        </p>
        <div className="application-outcome-meta">
          <span>Nominal simulasi: {currencyFormat.format(application.loan_amount)}</span>
          {application.reviewed_at && (
            <span>
              Ditinjau{" "}
              {dashboardDateTimeFormat.format(new Date(application.reviewed_at))}
            </span>
          )}
          <span>ID #{application.id.slice(0, 8).toUpperCase()}</span>
        </div>
        {application.review_note && (
          <div className="application-outcome-note">
            <strong>Catatan evaluator</strong>
            <p>{application.review_note}</p>
          </div>
        )}
        {onViewDetails && (
          <button
            className="table-link application-outcome-link"
            onClick={onViewDetails}
            type="button"
          >
            Lihat rincian pengajuan <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
