import type { ScoreFactor } from "@/src/types";

export function parseScoreFactors(value: unknown): ScoreFactor[] {
  if (!Array.isArray(value)) {
    throw new Error("Data faktor skor tidak valid pada database.");
  }
  return value.map((factor) => {
    if (
      typeof factor !== "object" ||
      factor === null ||
      !("label" in factor) ||
      !("points" in factor) ||
      !("maximum" in factor) ||
      !("explanation" in factor) ||
      typeof factor.label !== "string" ||
      typeof factor.points !== "number" ||
      typeof factor.maximum !== "number" ||
      typeof factor.explanation !== "string"
    ) {
      throw new Error("Data faktor skor tidak valid pada database.");
    }
    return {
      label: factor.label,
      points: factor.points,
      maximum: factor.maximum,
      explanation: factor.explanation,
    };
  });
}
