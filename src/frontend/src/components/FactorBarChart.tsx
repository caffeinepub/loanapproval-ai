import type { KeyFactor } from "../backend";

interface FactorBarChartProps {
  factors: KeyFactor[];
}

const BAR_COLORS = ["#2F7D4C", "#0F5C6B", "#1F7A5C", "#0B2E5E"];

export function FactorBarChart({ factors }: FactorBarChartProps) {
  const top4 = factors.slice(0, 4);
  const maxScore = Math.max(...top4.map((f) => Math.abs(f.impactScore)), 1);

  return (
    <div className="flex flex-col gap-3">
      {top4.map((factor, i) => {
        const pct = (Math.abs(factor.impactScore) / maxScore) * 100;
        return (
          <div key={factor.factorName} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[160px]">
                {factor.factorName}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}
              >
                {factor.impactScore > 0 ? "+" : ""}
                {factor.impactScore.toFixed(1)}
              </span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                  transition: "width 0.8s ease-out",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
