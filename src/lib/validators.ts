import type { ApplicationInput } from "@/src/types";

export interface ValidationResult {
  value?: ApplicationInput;
  errors: Partial<Record<keyof ApplicationInput, string>>;
}

export interface ReviewDecision {
  status: "approved" | "declined";
  reviewNote: string;
}

export type ReviewDecisionValidation =
  | { value: ReviewDecision; error: null }
  | { value: null; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function validateReviewDecision(
  value: unknown,
): ReviewDecisionValidation {
  if (
    !isRecord(value) ||
    (value.status !== "approved" && value.status !== "declined")
  ) {
    return { value: null, error: "Status evaluasi tidak valid." };
  }

  const reviewNote =
    typeof value.reviewNote === "string" ? value.reviewNote.trim() : "";
  const reviewNoteLength = Array.from(reviewNote).length;
  if (reviewNoteLength < 10 || reviewNoteLength > 1000) {
    return {
      value: null,
      error: "Catatan keputusan harus berisi 10 sampai 1000 karakter.",
    };
  }

  return {
    value: {
      status: value.status,
      reviewNote,
    },
    error: null,
  };
}

export function validateApplication(value: unknown): ValidationResult {
  const errors: ValidationResult["errors"] = {};
  if (!isRecord(value)) {
    return { errors: { monthlyIncome: "Formulir tidak valid." } };
  }

  const numberFields = [
    "monthlyIncome",
    "monthlyDebt",
    "loanAmount",
    "loanTermMonths",
    "employmentYears",
    "creditHistoryYears",
  ] as const;
  const numbers = {} as Record<(typeof numberFields)[number], number>;

  for (const field of numberFields) {
    const raw = value[field];
    const parsed =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw.trim() !== ""
          ? Number(raw)
          : NaN;
    if (!Number.isFinite(parsed)) {
      errors[field] = "Masukkan angka yang valid.";
      continue;
    }
    numbers[field] = parsed;
  }

  const ranges: Record<(typeof numberFields)[number], [number, number]> = {
    monthlyIncome: [1, 1_000_000_000],
    monthlyDebt: [0, 1_000_000_000],
    loanAmount: [1_000_000, 10_000_000_000],
    loanTermMonths: [3, 60],
    employmentYears: [0, 60],
    creditHistoryYears: [0, 60],
  };

  for (const field of numberFields) {
    const number = numbers[field];
    if (!Number.isFinite(number)) continue;
    const [minimum, maximum] = ranges[field];
    if (number < minimum || number > maximum) {
      errors[field] = `Nilai harus antara ${minimum.toLocaleString("id-ID")} dan ${maximum.toLocaleString("id-ID")}.`;
    }
    if (
      (field === "monthlyIncome" ||
        field === "monthlyDebt" ||
        field === "loanAmount") &&
      !Number.isInteger(number)
    ) {
      errors[field] = "Nominal Rupiah harus berupa bilangan bulat.";
    }
    if (field === "loanTermMonths" && !Number.isInteger(number)) {
      errors[field] = "Tenor harus berupa bilangan bulat.";
    }
    if (
      (field === "employmentYears" || field === "creditHistoryYears") &&
      !Number.isInteger(number * 2)
    ) {
      errors[field] = "Masukkan nilai dalam kelipatan setengah tahun.";
    }
  }

  if (
    Number.isFinite(numbers.monthlyDebt) &&
    Number.isFinite(numbers.monthlyIncome) &&
    numbers.monthlyDebt > numbers.monthlyIncome * 5
  ) {
    errors.monthlyDebt = "Total cicilan bulanan tampak tidak wajar.";
  }

  if (typeof value.recentDefaults !== "boolean") {
    errors.recentDefaults = "Pilih salah satu opsi.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    value: {
      monthlyIncome: numbers.monthlyIncome,
      monthlyDebt: numbers.monthlyDebt,
      loanAmount: numbers.loanAmount,
      loanTermMonths: numbers.loanTermMonths,
      employmentYears: numbers.employmentYears,
      creditHistoryYears: numbers.creditHistoryYears,
      recentDefaults: value.recentDefaults === true,
    },
  };
}
