import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { PredictionResult } from "../backend";
import { DonutChart } from "./DonutChart";
import { FactorBarChart } from "./FactorBarChart";
import { GaugeChart } from "./GaugeChart";

interface PredictionDashboardProps {
  result: PredictionResult | null;
  annualIncome: number;
  monthlyDebt: number;
}

export function PredictionDashboard({
  result,
  annualIncome,
  monthlyDebt,
}: PredictionDashboardProps) {
  if (!result) {
    return (
      <div
        data-ocid="dashboard.empty_state"
        className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="w-9 h-9 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-lg">
            No Prediction Yet
          </p>
          <p className="text-muted-foreground text-sm mt-1 max-w-[260px]">
            Fill out the application form and submit to see your loan approval
            prediction here.
          </p>
        </div>
        <div className="flex gap-2 mt-2">
          {["Credit Score", "Income", "Debt Ratio"].map((label) => (
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

  const debtRatio =
    annualIncome > 0 ? ((monthlyDebt * 12) / annualIncome) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-5"
      data-ocid="dashboard.panel"
    >
      {/* Gauge Card */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-card flex flex-col items-center">
        <p className="text-sm font-semibold text-muted-foreground mb-3 self-start">
          Approval Prediction
        </p>
        <GaugeChart
          likelihood={result.approvalLikelihood}
          decision={result.decision}
        />
      </div>

      {/* Key Factor Impact */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-card">
        <p className="text-sm font-semibold text-foreground mb-4">
          Key Factor Impact
        </p>
        {result.keyFactors.length > 0 ? (
          <FactorBarChart factors={result.keyFactors} />
        ) : (
          <p className="text-xs text-muted-foreground">
            No factor data available.
          </p>
        )}
      </div>

      {/* Debt-to-Income Donut */}
      <div className="bg-white rounded-xl border border-border p-5 shadow-card">
        <p className="text-sm font-semibold text-foreground mb-3">
          Debt-to-Income Ratio
        </p>
        <DonutChart debtRatio={debtRatio} />
      </div>
    </motion.div>
  );
}
