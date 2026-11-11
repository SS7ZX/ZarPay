import { describe, expect, it } from "vitest";
import { summarizeDashboardPage } from "./dashboard-insights";

describe("summarizeDashboardPage", () => {
  it("calculates risk percentages and status counts from the visible page only", () => {
    const summary = summarizeDashboardPage([
      { risk_tier: "low", status: "pending" },
      { risk_tier: "low", status: "approved" },
      { risk_tier: "high", status: "declined" },
      { risk_tier: "moderate", status: "pending" },
    ]);

    expect(summary.total).toBe(4);
    expect(summary.riskDistribution).toEqual([
      { tier: "low", label: "Risiko rendah", count: 2, percent: 50 },
      { tier: "moderate", label: "Risiko moderat", count: 1, percent: 25 },
      { tier: "elevated", label: "Perlu perhatian", count: 0, percent: 0 },
      { tier: "high", label: "Risiko tinggi", count: 1, percent: 25 },
    ]);
    expect(summary.statusCounts).toEqual({
      pending: 2,
      approved: 1,
      declined: 1,
    });
  });

  it("returns zeroed summaries for an empty page", () => {
    const summary = summarizeDashboardPage([]);

    expect(summary.total).toBe(0);
    expect(summary.statusCounts).toEqual({
      pending: 0,
      approved: 0,
      declined: 0,
    });
    expect(summary.riskDistribution.every((item) => item.percent === 0)).toBe(true);
  });
});
