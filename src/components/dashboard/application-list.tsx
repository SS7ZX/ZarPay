import Link from "next/link";
import type {
  ApplicationStatus,
  DashboardApplication,
} from "@/src/types";
import {
  currencyFormat,
  dashboardDateFormat,
  dashboardPageHref,
  initials,
  statusLabels,
} from "./dashboard-utils";

interface ApplicationListProps {
  applications: DashboardApplication[];
  evaluator: boolean;
  onSelect: (application: DashboardApplication) => void;
  page: number;
  pageSize: number;
  searchQuery: string;
  statusFilter: "all" | ApplicationStatus;
  totalApplications: number;
  totalCount: number;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="score-badge" aria-label={`Skor kredit ${score}`}>
      {score}
    </span>
  );
}

export function ApplicationList({
  applications,
  evaluator,
  onSelect,
  page,
  pageSize,
  searchQuery,
  statusFilter,
  totalApplications,
  totalCount,
}: ApplicationListProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);
  const hasFilters = Boolean(searchQuery) || statusFilter !== "all";

  return (
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
        <form action="/dashboard" className="table-controls">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Cari pengajuan"
              defaultValue={searchQuery}
              maxLength={100}
              name="q"
              placeholder="Cari nama atau ID lengkap"
            />
          </label>
          <select
            aria-label="Filter status"
            defaultValue={statusFilter}
            name="status"
          >
            <option value="all">Semua status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui (simulasi)</option>
            <option value="declined">Tidak disetujui (simulasi)</option>
          </select>
          <button className="button button-primary button-small" type="submit">
            Terapkan
          </button>
        </form>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">Z</div>
          <h3>
            {hasFilters || totalApplications > 0
              ? "Tidak ada hasil"
              : "Belum ada pengajuan"}
          </h3>
          <p>
            {hasFilters || totalApplications > 0
              ? "Coba ubah kata pencarian atau filter status."
              : evaluator
                ? "Pengajuan baru akan muncul di sini."
                : "Mulai dengan mengisi profil pinjaman Anda."}
          </p>
          {!evaluator && totalApplications === 0 && !hasFilters && (
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
              {applications.map((application) => (
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
                  <td>{currencyFormat.format(application.loan_amount)}</td>
                  <td><ScoreBadge score={application.credit_score} /></td>
                  <td>{(application.dti_ratio * 100).toFixed(1)}%</td>
                  <td>
                    <span className={`status-pill status-${application.status}`}>
                      <span className="status-dot" />
                      {statusLabels[application.status]}
                    </span>
                  </td>
                  <td>{dashboardDateFormat.format(new Date(application.created_at))}</td>
                  <td>
                    <button
                      className="table-link"
                      onClick={() => onSelect(application)}
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
      {totalCount > 0 && (
        <div className="table-pagination">
          <span>
            Menampilkan {firstItem}–{lastItem} dari {totalCount} hasil
          </span>
          <nav aria-label="Halaman pengajuan">
            {page > 1 ? (
              <Link
                href={dashboardPageHref(page - 1, searchQuery, statusFilter)}
                rel="prev"
              >
                Sebelumnya
              </Link>
            ) : (
              <span aria-disabled="true">Sebelumnya</span>
            )}
            <span aria-current="page">
              Halaman {page} dari {pageCount}
            </span>
            {page < pageCount ? (
              <Link
                href={dashboardPageHref(page + 1, searchQuery, statusFilter)}
                rel="next"
              >
                Selanjutnya
              </Link>
            ) : (
              <span aria-disabled="true">Selanjutnya</span>
            )}
          </nav>
        </div>
      )}
    </section>
  );
}
