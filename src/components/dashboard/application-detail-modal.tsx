"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { DashboardApplication } from "@/src/types";
import {
  currencyFormat,
  dashboardDateTimeFormat,
  riskLabels,
  statusLabels,
} from "./dashboard-utils";

interface ApplicationDetailModalProps {
  actionError: string;
  application: DashboardApplication;
  busy: boolean;
  evaluator: boolean;
  onClose: () => void;
  onReview: (status: "approved" | "declined") => void;
  onReviewNoteChange: (value: string) => void;
  reviewNote: string;
  reviewNoteError: string;
}

export function ApplicationDetailModal({
  actionError,
  application,
  busy,
  evaluator,
  onClose,
  onReview,
  onReviewNoteChange,
  reviewNote,
  reviewNoteError,
}: ApplicationDetailModalProps) {
  const modalRef = useRef<HTMLElement | null>(null);
  const [decisionToConfirm, setDecisionToConfirm] = useState<
    "approved" | "declined" | null
  >(null);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.querySelector<HTMLButtonElement>(".modal-close")?.focus();
    return () => previouslyFocused?.focus();
  }, [application.id]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const dialog = event.currentTarget;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      dialog.focus();
    } else if (!dialog.contains(document.activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="detail-title"
        aria-modal="true"
        className="detail-modal"
        onKeyDown={handleKeyDown}
        ref={modalRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">RINCIAN PENILAIAN</p>
            <h2 id="detail-title">{application.applicant_name}</h2>
            <span className="modal-reference">
              ID #{application.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <button
            className="icon-button modal-close"
            onClick={onClose}
            aria-label="Tutup detail"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="score-summary">
          <div className="score-ring">
            <strong>{application.credit_score}</strong>
            <span>SKOR</span>
          </div>
          <div>
            <span className={`risk-pill risk-${application.risk_tier}`}>
              {riskLabels[application.risk_tier]}
            </span>
            <p>Rentang penilaian ZarPay: 300–850</p>
          </div>
        </div>
        <div className="detail-metrics">
          <div>
            <span>Pendapatan bulanan</span>
            <strong>{currencyFormat.format(application.monthly_income)}</strong>
          </div>
          <div>
            <span>Kewajiban bulanan saat ini</span>
            <strong>{currencyFormat.format(application.monthly_debt)}</strong>
          </div>
          <div>
            <span>Pinjaman</span>
            <strong>{currencyFormat.format(application.loan_amount)}</strong>
          </div>
          <div>
            <span>Estimasi cicilan / bln</span>
            <strong>{currencyFormat.format(application.estimated_payment)}</strong>
          </div>
          <div>
            <span>DTI pascapinjaman</span>
            <strong>{(application.dti_ratio * 100).toFixed(1)}%</strong>
          </div>
          <div>
            <span>Tenor</span>
            <strong>{application.loan_term_months} bulan</strong>
          </div>
          <div>
            <span>Lama bekerja</span>
            <strong>{application.employment_years} tahun</strong>
          </div>
          <div>
            <span>Riwayat kredit</span>
            <strong>{application.credit_history_years} tahun</strong>
          </div>
          <div>
            <span>Tunggakan terbaru dilaporkan</span>
            <strong>{application.recent_defaults ? "Ya" : "Tidak"}</strong>
          </div>
        </div>
        <div className="factor-heading">
          <h3>Faktor pembentuk skor</h3>
          <span>Simulasi berbasis aturan</span>
        </div>
        <ul className="factor-list">
          {application.score_factors.map((factor) => (
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
        {application.status !== "pending" && (
          <div className="review-audit">
            <div>
              <span>Keputusan dicatat</span>
              <strong>
                {application.reviewed_at
                  ? dashboardDateTimeFormat.format(new Date(application.reviewed_at))
                  : "Waktu tidak tersedia"}
              </strong>
            </div>
            <div>
              <span>Evaluator</span>
              <strong>{application.reviewer_name ?? "Nama tidak tersedia"}</strong>
            </div>
          </div>
        )}
        {application.review_note ? (
          <div className="review-note-display">
            <h3>Catatan keputusan simulasi</h3>
            <p>{application.review_note}</p>
          </div>
        ) : application.status !== "pending" ? (
          <div className="review-note-display">
            <h3>Catatan keputusan simulasi</h3>
            <p>
              Catatan tidak tersedia untuk keputusan yang tercatat sebelum
              pembaruan ini.
            </p>
          </div>
        ) : null}
        <div className="modal-footer">
          <span className={`status-pill status-${application.status}`}>
            <span className="status-dot" /> {statusLabels[application.status]}
          </span>
          {evaluator && application.status === "pending" && (
            <div className="review-controls">
              <div className="review-note-field">
                <label htmlFor="review-note">Alasan keputusan simulasi</label>
                <textarea
                  aria-describedby={
                    reviewNoteError
                      ? "review-note-hint review-note-error"
                      : "review-note-hint"
                  }
                  aria-invalid={Boolean(reviewNoteError)}
                  id="review-note"
                  maxLength={1000}
                  minLength={10}
                  onChange={(event) => onReviewNoteChange(event.target.value)}
                  required
                  rows={3}
                  value={reviewNote}
                />
                <span className="review-note-hint" id="review-note-hint">
                  10–1000 karakter. Catatan terlihat oleh peminjam; jangan cantumkan data sensitif.
                </span>
                {reviewNoteError && (
                  <span className="field-error" id="review-note-error" role="alert">
                    {reviewNoteError}
                  </span>
                )}
              </div>
              {actionError && (
                <p className="alert alert-error" role="alert">
                  {actionError}
                </p>
              )}
              {decisionToConfirm ? (
                <div
                  aria-labelledby="review-confirmation-title"
                  aria-live="polite"
                  className="review-confirmation"
                >
                  <div>
                    <strong id="review-confirmation-title">
                      Konfirmasi{" "}
                      {decisionToConfirm === "approved"
                        ? "persetujuan"
                        : "penolakan"}
                    </strong>
                    <p>
                      Keputusan ini akan dicatat dan tidak dapat diubah dari
                      panel. Ini hanya keputusan simulasi, bukan persetujuan
                      pinjaman atau pencairan dana.
                    </p>
                  </div>
                  <div className="review-confirmation-actions">
                    <button
                      className="button button-quiet"
                      disabled={busy}
                      onClick={() => setDecisionToConfirm(null)}
                      type="button"
                    >
                      Periksa kembali
                    </button>
                    <button
                      className="button button-primary"
                      disabled={busy}
                      onClick={() => onReview(decisionToConfirm)}
                      type="button"
                    >
                      {busy ? "Menyimpan..." : "Konfirmasi dan simpan"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="review-actions">
                  <button
                    className="button button-quiet"
                    disabled={busy}
                    onClick={() => setDecisionToConfirm("declined")}
                    type="button"
                  >
                    Tolak simulasi
                  </button>
                  <button
                    className="button button-primary"
                    disabled={busy}
                    onClick={() => setDecisionToConfirm("approved")}
                    type="button"
                  >
                    Setujui simulasi
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="disclaimer">
          Hasil ini merupakan simulasi untuk keperluan akademik. Keputusan
          tidak menggantikan pemeriksaan kredit atau nasihat keuangan.
        </p>
      </section>
    </div>
  );
}
