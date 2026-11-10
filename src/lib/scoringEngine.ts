import type {
  ApplicationInput,
  RiskTier,
  ScoringResult,
  ScoreFactor,
} from "@/src/types";

const DEMO_APR = 0.12;

function calculatePayment(principal: number, months: number): number {
  const monthlyRate = DEMO_APR / 12;
  const growth = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * growth) / (growth - 1);
}

function resolveTier(score: number): RiskTier {
  if (score >= 740) return "low";
  if (score >= 670) return "moderate";
  if (score >= 580) return "elevated";
  return "high";
}

export function calculateScore(input: ApplicationInput): ScoringResult {
  const estimatedPayment = calculatePayment(
    input.loanAmount,
    input.loanTermMonths,
  );
  const dtiRatio =
    (input.monthlyDebt + estimatedPayment) / input.monthlyIncome;
  const loanToAnnualIncome =
    (input.loanAmount / (input.monthlyIncome * 12)) * 100;

  const scoreFactors: ScoreFactor[] = [
    {
      label: "Rasio utang terhadap pendapatan",
      points:
        dtiRatio <= 0.2
          ? 140
          : dtiRatio <= 0.3
            ? 120
            : dtiRatio <= 0.36
              ? 95
              : dtiRatio <= 0.43
                ? 65
                : dtiRatio <= 0.5
                  ? 30
                  : 0,
      maximum: 140,
      explanation: `DTI setelah estimasi cicilan: ${(dtiRatio * 100).toFixed(1)}%.`,
    },
    {
      label: "Pendapatan bulanan",
      points:
        input.monthlyIncome >= 25_000_000
          ? 120
          : input.monthlyIncome >= 15_000_000
            ? 100
            : input.monthlyIncome >= 8_000_000
              ? 75
              : input.monthlyIncome >= 5_000_000
                ? 50
                : 25,
      maximum: 120,
      explanation: "Pendapatan lebih tinggi memberi ruang pembayaran lebih luas.",
    },
    {
      label: "Stabilitas pekerjaan",
      points:
        input.employmentYears >= 5
          ? 80
          : input.employmentYears >= 3
            ? 65
            : input.employmentYears >= 1
              ? 45
              : 20,
      maximum: 80,
      explanation: `Lama bekerja: ${input.employmentYears} tahun.`,
    },
    {
      label: "Riwayat kredit",
      points:
        input.creditHistoryYears >= 7
          ? 80
          : input.creditHistoryYears >= 4
            ? 65
            : input.creditHistoryYears >= 2
              ? 45
              : input.creditHistoryYears >= 1
                ? 30
                : 15,
      maximum: 80,
      explanation: `Riwayat kredit: ${input.creditHistoryYears} tahun.`,
    },
    {
      label: "Beban pinjaman yang diajukan",
      points:
        loanToAnnualIncome <= 20
          ? 80
          : loanToAnnualIncome <= 35
            ? 65
            : loanToAnnualIncome <= 50
              ? 45
              : loanToAnnualIncome <= 75
                ? 25
                : 10,
      maximum: 80,
      explanation: `Jumlah pinjaman setara ${loanToAnnualIncome.toFixed(1)}% pendapatan tahunan.`,
    },
    {
      label: "Tunggakan terbaru",
      points: input.recentDefaults ? 0 : 50,
      maximum: 50,
      explanation: input.recentDefaults
        ? "Tunggakan terbaru mengurangi skor pada simulasi."
        : "Tidak ada tunggakan terbaru yang dilaporkan.",
    },
  ];

  const creditScore = Math.min(
    850,
    Math.max(
      300,
      300 + scoreFactors.reduce((total, factor) => total + factor.points, 0),
    ),
  );

  return {
    creditScore,
    dtiRatio,
    estimatedPayment,
    riskTier: resolveTier(creditScore),
    scoreFactors,
  };
}
