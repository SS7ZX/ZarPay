"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { ApplicationDecisionCard } from "@/src/components/common/application-decision-card";
import { ApplicationDetailModal } from "@/src/components/dashboard/application-detail-modal";
import { DashboardInsights } from "@/src/components/dashboard/dashboard-insights";
import { ApplicationList } from "@/src/components/dashboard/application-list";
import { BrandLogo } from "@/src/components/common/brand-logo";
import type {
  ApplicationStatus,
  DashboardApplication,
  DashboardStats,
  Profile,
  UserRole,
} from "@/src/types";
import {
  currencyFormat,
  dashboardDateFormat,
  initials,
} from "./dashboard-utils";

interface DashboardClientProps {
  profile: Profile;
  email: string;
  applications: DashboardApplication[];
  page: number;
  pageSize: number;
  totalCount: number;
  searchQuery: string;
  statusFilter: "all" | ApplicationStatus;
  stats: DashboardStats;
}

function responseError(payload: unknown): string {
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

function parseReviewResult(
  payload: unknown,
): Pick<
  DashboardApplication,
  "id" | "status" | "reviewed_at" | "reviewed_by" | "review_note"
> | null {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("application" in payload) ||
    typeof payload.application !== "object" ||
    payload.application === null
  ) {
    return null;
  }
  const application = payload.application;
  if (
    !("id" in application) ||
    !("status" in application) ||
    !("reviewed_at" in application) ||
    !("reviewed_by" in application) ||
    !("review_note" in application) ||
    typeof application.id !== "string" ||
    (application.status !== "approved" && application.status !== "declined") ||
    typeof application.reviewed_at !== "string" ||
    typeof application.reviewed_by !== "string" ||
    typeof application.review_note !== "string"
  ) {
    return null;
  }
  return {
    id: application.id,
    status: application.status,
    reviewed_at: application.reviewed_at,
    reviewed_by: application.reviewed_by,
    review_note: application.review_note,
  };
}

export function DashboardClient({
  profile,
  email,
  applications,
  page,
  pageSize,
  totalCount,
  searchQuery,
  statusFilter,
  stats,
}: DashboardClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<DashboardApplication | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewNoteError, setReviewNoteError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const role: UserRole = profile.role;
  const evaluator = role === "evaluator";
  const pendingCount = stats.pendingApplications;
  const latestApplication = applications[0];
  const latestDecision =
    !evaluator && page === 1 && !searchQuery && statusFilter === "all"
      ? latestApplication && latestApplication.status !== "pending"
        ? latestApplication
        : null
      : null;

  function openApplicationDetails(application: DashboardApplication) {
    setSelected(application);
    setReviewNote("");
    setReviewNoteError("");
    setActionError("");
  }

  async function reviewApplication(
    application: DashboardApplication,
    status: "approved" | "declined",
  ) {
    setActionError("");
    const note = reviewNote.trim();
    const noteLength = Array.from(note).length;
    if (noteLength < 10 || noteLength > 1000) {
      setReviewNoteError("Catatan keputusan harus berisi 10 sampai 1000 karakter.");
      return;
    }
    setReviewNoteError("");
    setBusyId(application.id);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote: note }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseError(payload));
      const result = parseReviewResult(payload);
      if (!result || result.id !== application.id) {
        throw new Error("Respons keputusan tidak valid. Muat ulang dashboard.");
      }
      const updated = {
        ...application,
        ...result,
        reviewer_name: profile.full_name,
      };
      setSelected((current) =>
        current?.id === application.id ? { ...current, ...updated } : current,
      );
      router.refresh();
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
    setActionError("");
    try {
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Failed to sign out:",
        error instanceof Error ? error.message : error,
      );
      setActionError("Keluar gagal. Silakan coba kembali.");
      setSigningOut(false);
    }
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
          <Link
            className="side-nav-link"
            href={evaluator ? "/evaluator/profile" : "/profile"}
          >
            <span className="nav-symbol" aria-hidden="true">◎</span>
            {evaluator ? "Profil evaluator" : "Profil saya"}
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
              {dashboardDateFormat.format(new Date())}
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

        {latestDecision && (
          <ApplicationDecisionCard
            application={latestDecision}
            onViewDetails={() => openApplicationDetails(latestDecision)}
          />
        )}

        {actionError && !selected && (
          <p className="alert alert-error" role="alert">{actionError}</p>
        )}

        <section className="stats-grid" aria-label="Statistik pengajuan">
          <article className="stat-card stat-card-primary">
            <div className="stat-card-top">
              <span>Total pengajuan</span>
              <span className="stat-icon">▤</span>
            </div>
            <strong>{stats.totalApplications}</strong>
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
            <strong>{stats.averageCreditScore ?? "—"}</strong>
            <span className="stat-foot">Rentang simulasi 300–850</span>
          </article>
          <article className="stat-card">
            <div className="stat-card-top">
              <span>Total nilai pinjaman</span>
              <span className="stat-icon stat-icon-purple">◈</span>
            </div>
            <strong className="stat-currency">
              {currencyFormat.format(BigInt(stats.totalLoanValue))}
            </strong>
            <span className="stat-foot">Nilai pengajuan terkumpul</span>
          </article>
        </section>

        <DashboardInsights
          applications={applications}
          page={page}
        />
        <ApplicationList
          applications={applications}
          evaluator={evaluator}
          onSelect={openApplicationDetails}
          page={page}
          pageSize={pageSize}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          totalApplications={stats.totalApplications}
          totalCount={totalCount}
        />
        <footer className="page-footer">
          <span>ZarPay © {new Date().getFullYear()}</span>
          <span>Penilaian berbasis aturan simulasi</span>
        </footer>
      </main>

      {selected && (
        <ApplicationDetailModal
          actionError={actionError}
          application={selected}
          busy={busyId === selected.id}
          evaluator={evaluator}
          onClose={() => setSelected(null)}
          onReview={(status) => reviewApplication(selected, status)}
          onReviewNoteChange={(value) => {
            setReviewNote(value);
            setReviewNoteError("");
          }}
          reviewNote={reviewNote}
          reviewNoteError={reviewNoteError}
        />
      )}
    </div>
  );
}
