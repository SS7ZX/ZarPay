import { describe, expect, it } from "vitest";
import { analyzeEvaluatorReviews } from "./evaluator-review-analytics";

describe("analyzeEvaluatorReviews", () => {
  it("summarizes outcomes, risk tiers, and valid turnaround durations", () => {
    const summary = analyzeEvaluatorReviews([
      {
        status: "approved",
        risk_tier: "low",
        created_at: "2026-01-01T00:00:00.000Z",
        reviewed_at: "2026-01-01T12:00:00.000Z",
      },
      {
        status: "declined",
        risk_tier: "high",
        created_at: "2026-01-01T00:00:00.000Z",
        reviewed_at: "2026-01-03T00:00:00.000Z",
      },
      {
        status: "declined",
        risk_tier: "moderate",
        created_at: "2026-01-02T00:00:00.000Z",
        reviewed_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(summary).toEqual({
      sampleCount: 3,
      sampleStatuses: { approved: 1, declined: 2 },
      riskCounts: { low: 1, moderate: 1, elevated: 0, high: 1 },
      averageTurnaroundHours: 30,
      timedReviewCount: 2,
    });
  });

  it("returns empty analytics without inventing results", () => {
    expect(analyzeEvaluatorReviews([])).toEqual({
      sampleCount: 0,
      sampleStatuses: { approved: 0, declined: 0 },
      riskCounts: { low: 0, moderate: 0, elevated: 0, high: 0 },
      averageTurnaroundHours: null,
      timedReviewCount: 0,
    });
  });
});
