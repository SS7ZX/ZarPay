import { describe, expect, it } from "vitest";
import {
  validateApplication,
  validateReviewDecision,
} from "./validators";

const validApplication = {
  monthlyIncome: 8_000_000,
  monthlyDebt: 1_500_000,
  loanAmount: 25_000_000,
  loanTermMonths: 12,
  employmentYears: 3,
  creditHistoryYears: 2,
  recentDefaults: false,
};

describe("validateApplication", () => {
  it("normalizes numeric form values before scoring", () => {
    const result = validateApplication({
      ...validApplication,
      monthlyIncome: "8000000",
      loanAmount: "25000000",
    });

    expect(result.errors).toEqual({});
    expect(result.value).toMatchObject({
      monthlyIncome: 8_000_000,
      loanAmount: 25_000_000,
    });
  });

  describe("validateReviewDecision", () => {
    it("requires a supported decision and a 10 to 1000 character note", () => {
      expect(validateReviewDecision({ status: "pending", reviewNote: "alasan cukup" }).value)
        .toBeNull();
      expect(validateReviewDecision({ status: "approved", reviewNote: "singkat" }).value)
        .toBeNull();
      expect(
        validateReviewDecision({
          status: "declined",
          reviewNote: "x".repeat(1001),
        }).value,
      ).toBeNull();
    });

    it("trims notes and counts Unicode code points consistently", () => {
      const result = validateReviewDecision({
        status: "approved",
        reviewNote: `  ${"😀".repeat(10)}  `,
      });

      expect(result.error).toBeNull();
      expect(result.value).toEqual({
        status: "approved",
        reviewNote: "😀".repeat(10),
      });
    });
  });

  it("rejects out-of-range amounts and unsupported precision", () => {
    const result = validateApplication({
      ...validApplication,
      monthlyIncome: 0,
      loanTermMonths: 12.5,
      employmentYears: 2.3,
    });

    expect(result.value).toBeUndefined();
    expect(result.errors.monthlyIncome).toBeDefined();
    expect(result.errors.loanTermMonths).toBeDefined();
    expect(result.errors.employmentYears).toBeDefined();
  });

  it("rejects fractional Rupiah amounts", () => {
    for (const field of ["monthlyIncome", "monthlyDebt", "loanAmount"] as const) {
      const result = validateApplication({
        ...validApplication,
        [field]: validApplication[field] + 0.5,
      });

      expect(result.value).toBeUndefined();
      expect(result.errors[field]).toBe("Nominal Rupiah harus berupa bilangan bulat.");
    }
  });

  it("rejects malformed payloads instead of treating absent answers as false", () => {
    const result = validateApplication({
      ...validApplication,
      recentDefaults: "",
    });

    expect(result.value).toBeUndefined();
    expect(result.errors.recentDefaults).toBeDefined();
  });
});
