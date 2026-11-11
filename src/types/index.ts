export type UserRole = "borrower" | "evaluator";

export type ApplicationStatus = "pending" | "approved" | "declined";

export type RiskTier = "low" | "moderate" | "elevated" | "high";

export interface ApplicationInput {
  monthlyIncome: number;
  monthlyDebt: number;
  loanAmount: number;
  loanTermMonths: number;
  employmentYears: number;
  creditHistoryYears: number;
  recentDefaults: boolean;
}

export interface ScoreFactor {
  label: string;
  points: number;
  maximum: number;
  explanation: string;
}

export interface ScoringResult {
  creditScore: number;
  dtiRatio: number;
  estimatedPayment: number;
  riskTier: RiskTier;
  scoreFactors: ScoreFactor[];
}

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
};

export interface ApplicationRecord {
  id: string;
  borrower_id: string;
  applicant_name: string;
  monthly_income: number;
  monthly_debt: number;
  loan_amount: number;
  loan_term_months: number;
  estimated_payment: number;
  dti_ratio: number;
  employment_years: number;
  credit_history_years: number;
  recent_defaults: boolean;
  credit_score: number;
  risk_tier: RiskTier;
  score_factors: ScoreFactor[];
  status: ApplicationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
}

export interface DashboardApplication extends ApplicationRecord {
  borrower_name: string;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  averageCreditScore: number | null;
  totalLoanValue: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile & { created_at: string };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          full_name?: string;
        };
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          borrower_id: string;
          applicant_name: string;
          monthly_income: number;
          monthly_debt: number;
          loan_amount: number;
          loan_term_months: number;
          estimated_payment: number;
          dti_ratio: number;
          employment_years: number;
          credit_history_years: number;
          recent_defaults: boolean;
          credit_score: number;
          risk_tier: RiskTier;
          score_factors: Json;
          status: ApplicationStatus;
          reviewed_at: string | null;
          reviewed_by: string | null;
          review_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          borrower_id: string;
          applicant_name: string;
          monthly_income: number;
          monthly_debt: number;
          loan_amount: number;
          loan_term_months: number;
          estimated_payment: number;
          dti_ratio: number;
          employment_years: number;
          credit_history_years: number;
          recent_defaults: boolean;
          credit_score: number;
          risk_tier: RiskTier;
          score_factors: Json;
          status?: ApplicationStatus;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_note?: string | null;
          created_at?: string;
        };
        Update: {
          status?: ApplicationStatus;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          review_note?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: UserRole | null;
      };
      dashboard_stats: {
        Args: Record<string, never>;
        Returns: {
          total_applications: number;
          pending_applications: number;
          average_credit_score: number | null;
          total_loan_value: string;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      application_status: ApplicationStatus;
      risk_tier: RiskTier;
    };
    CompositeTypes: Record<string, never>;
  };
}
