import { describe, expect, it } from "vitest";
import { calculateScore } from "./scoringEngine";
import type { ApplicationInput } from "@/src/types";

const input: ApplicationInput = {
  monthlyIncome: 8_000_000,
  monthlyDebt: 1_500_000,
  loanAmount: 25_000_000,
  loanTermMonths: 12,
  employmentYears: 3,
  creditHistoryYears: 2,
  recentDefaults: false,
};

describe("calculateScore", () => {
  it("uses the amortized payment in the post-loan DTI", () => {
    const result = calculateScore(input);
    const monthlyRate = 0.12 / 12;
    const growth = (1 + monthlyRate) ** input.loanTermMonths;
    const expectedPayment =
      (input.loanAmount * monthlyRate * growth) / (growth - 1);

    expect(result.estimatedPayment).toBeCloseTo(expectedPayment, 8);
    expect(result.dtiRatio).toBeCloseTo(
      (input.monthlyDebt + expectedPayment) / input.monthlyIncome,
      10,
    );
  });

  it("keeps the score within its published range and accounts for every factor", () => {
    const result = calculateScore(input);
    const factorPoints = result.scoreFactors.reduce(
      (total, factor) => total + factor.points,
      0,
    );
    const maximumPoints = result.scoreFactors.reduce(
      (total, factor) => total + factor.maximum,
      0,
    );

    expect(result.creditScore).toBeGreaterThanOrEqual(300);
    expect(result.creditScore).toBeLessThanOrEqual(850);
    expect(result.creditScore).toBe(Math.min(850, 300 + factorPoints));
    expect(factorPoints).toBeLessThanOrEqual(maximumPoints);
    expect(result.scoreFactors).toHaveLength(6);
  });
});
