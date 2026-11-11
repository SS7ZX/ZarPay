import type { ApplicationStatus, RiskTier } from "@/src/types";

export const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const dashboardDateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Menunggu tinjauan",
  approved: "Disetujui (simulasi)",
  declined: "Tidak disetujui (simulasi)",
};

export const riskLabels: Record<RiskTier, string> = {
  low: "Risiko rendah",
  moderate: "Risiko moderat",
  elevated: "Perlu perhatian",
  high: "Risiko tinggi",
};

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase("id-ID"))
    .join("");
}

export function dashboardPageHref(
  page: number,
  searchQuery: string,
  statusFilter: "all" | ApplicationStatus,
): string {
  const params = new URLSearchParams({ page: String(page) });
  if (searchQuery) params.set("q", searchQuery);
  if (statusFilter !== "all") params.set("status", statusFilter);
  return `/dashboard?${params.toString()}`;
}
