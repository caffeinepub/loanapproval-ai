import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { PredictionResult } from "../backend";
import { Decision } from "../backend";
import { FactorBarChart } from "./FactorBarChart";
import { GaugeChart } from "./GaugeChart";

interface SubmittedData {
  annualIncome: number;
  monthlyDebt: number;
  creditScore: number;
  loanAmount: number;
}

interface PredictionDashboardProps {
  result: PredictionResult | null;
  submittedData: SubmittedData | null;
}

function decisionStyle(decision: Decision) {
  if (decision === Decision.approved)
    return {
      badgeClass: "status-approved",
      label: "APPROVED",
      message: "Congratulations! Your application meets our approval criteria.",
    };
  if (decision === Decision.denied)
    return {
      badgeClass: "status-denied",
      label: "DENIED",
      message: "Based on current criteria, this application has been declined.",
    };
  return {
    badgeClass: "status-review",
    label: "UNDER REVIEW",
    message: "Your application requires additional review by our team.",
  };
}

function getCreditLabel(score: number): string {
  if (score >= 750) return "Excellent";
  if (score >= 700) return "Good";
  if (score >= 650) return "Fair";
  return "Poor";
}

function getDTILabel(ratio: number): string {
  if (ratio <= 30) return "Healthy";
  if (ratio <= 43) return "Moderate";
  return "High";
}

function getITLLabel(ratio: number): string {
  if (ratio >= 2) return "Strong";
  if (ratio >= 1.5) return "Moderate";
  return "Weak";
}

function kpiLabelColor(label: string): string {
  const positive = ["Excellent", "Good", "Healthy", "Strong"];
  const negative = ["Poor", "High", "Weak"];
  if (positive.includes(label)) return "text-emerald-700";
  if (negative.includes(label)) return "text-red-600";
  return "text-amber-600";
}

export function PredictionDashboard({
  result,
  submittedData,
}: PredictionDashboardProps) {
  if (!result || !submittedData) {
    return (
      <div
        data-ocid="dashboard.empty_state"
        className="bg-card rounded-xl border border-border shadow-card flex flex-col items-center justify-center min-h-[400px] gap-5 text-center p-8"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-7 h-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-lg">
            No Prediction Yet
          </p>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xs">
            Fill in the Applicant Details form and click{" "}
            <strong>Generate Prediction</strong> to see results here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Credit Score",
            "Income",
            "Debt Ratio",
            "Employment",
            "Loan Term",
          ].map((label) => (
            <span
              key={label}
              className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const { annualIncome, monthlyDebt, creditScore, loanAmount } = submittedData;
  const dtiRatio =
    annualIncome > 0 ? (monthlyDebt / (annualIncome / 12)) * 100 : 0;
  const itlRatio = loanAmount > 0 ? annualIncome / loanAmount : 0;
  const ds = decisionStyle(result.decision);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
      data-ocid="dashboard.panel"
    >
      {/* ── Approval Status card ── */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Approval Status
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold tracking-wide ${ds.badgeClass}`}
                data-ocid="dashboard.status.badge"
              >
                {ds.label}
              </span>
              <span className="text-2xl font-bold text-foreground">
                {Math.round(result.approvalLikelihood)}%{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  Confidence
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{ds.message}</p>
          </div>
        </div>
      </div>

      {/* ── Key Financial Factors (3 KPI cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Credit Score */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Credit Score
          </p>
          <p className="text-2xl font-bold text-foreground">
            {creditScore}
            <span className="text-base font-normal text-muted-foreground">
              /850
            </span>
          </p>
          <p
            className={`text-sm font-semibold mt-1 ${kpiLabelColor(getCreditLabel(creditScore))}`}
          >
            {getCreditLabel(creditScore)}
          </p>
        </div>

        {/* Debt-to-Income */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Debt-to-Income
          </p>
          <p className="text-2xl font-bold text-foreground">
            {dtiRatio.toFixed(1)}
            <span className="text-base font-normal text-muted-foreground">
              %
            </span>
          </p>
          <p
            className={`text-sm font-semibold mt-1 ${kpiLabelColor(getDTILabel(dtiRatio))}`}
          >
            {getDTILabel(dtiRatio)}
          </p>
        </div>

        {/* Income-to-Loan */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Income-to-Loan
          </p>
          <p className="text-2xl font-bold text-foreground">
            {itlRatio.toFixed(2)}
            <span className="text-base font-normal text-muted-foreground">
              x
            </span>
          </p>
          <p
            className={`text-sm font-semibold mt-1 ${kpiLabelColor(getITLLabel(itlRatio))}`}
          >
            {getITLLabel(itlRatio)}
          </p>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Key Factors Impact */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">
            Key Factors Impact
          </p>
          {result.keyFactors.length > 0 ? (
            <FactorBarChart factors={result.keyFactors} />
          ) : (
            <p className="text-xs text-muted-foreground">
              No factor data available.
            </p>
          )}
        </div>

        {/* Approval Probability Gauge */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col items-center">
          <p className="text-sm font-semibold text-foreground mb-2 self-start">
            Approval Probability
          </p>
          <GaugeChart
            likelihood={result.approvalLikelihood}
            decision={result.decision}
          />
        </div>
      </div>
    </motion.div>
  );
}
