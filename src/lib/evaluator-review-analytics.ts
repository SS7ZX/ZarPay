import type { ApplicationStatus, RiskTier } from "@/src/types";

export interface EvaluatorReviewSample {
  status: Exclude<ApplicationStatus, "pending">;
  risk_tier: RiskTier;
  created_at: string;
  reviewed_at: string | null;
}

export interface EvaluatorReviewAnalytics {
  sampleCount: number;
  sampleStatuses: Record<Exclude<ApplicationStatus, "pending">, number>;
  riskCounts: Record<RiskTier, number>;
  averageTurnaroundHours: number | null;
  timedReviewCount: number;
}

export function analyzeEvaluatorReviews(
  reviews: EvaluatorReviewSample[],
): EvaluatorReviewAnalytics {
  const sampleStatuses = { approved: 0, declined: 0 };
  const riskCounts: Record<RiskTier, number> = {
    low: 0,
    moderate: 0,
    elevated: 0,
    high: 0,
  };
  const turnaroundDurations: number[] = [];

  for (const review of reviews) {
    sampleStatuses[review.status] += 1;
    riskCounts[review.risk_tier] += 1;

    if (!review.reviewed_at) continue;
    const createdAt = Date.parse(review.created_at);
    const reviewedAt = Date.parse(review.reviewed_at);
    const duration = reviewedAt - createdAt;
    if (Number.isFinite(duration) && duration >= 0) {
      turnaroundDurations.push(duration);
    }
  }

  const totalTurnaroundHours = turnaroundDurations.reduce(
    (total, duration) => total + duration / (60 * 60 * 1000),
    0,
  );

  return {
    sampleCount: reviews.length,
    sampleStatuses,
    riskCounts,
    averageTurnaroundHours: turnaroundDurations.length
      ? totalTurnaroundHours / turnaroundDurations.length
      : null,
    timedReviewCount: turnaroundDurations.length,
  };
}
