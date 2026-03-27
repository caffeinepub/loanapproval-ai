import type { KeyFactor } from "../backend";

interface FactorBarChartProps {
  factors: KeyFactor[];
}

export function FactorBarChart({ factors }: FactorBarChartProps) {
  const top5 = factors.slice(0, 5);
  const maxScore = Math.max(...top5.map((f) => Math.abs(f.impactScore)), 1);

  const getColor = (score: number) => {
    if (score >= 70) return "#1E7A3B";
    if (score >= 40) return "#1F63B5";
    if (score >= 20) return "#b45309";
    return "#dc2626";
  };

  return (
    <div className="flex flex-col gap-3.5">
      {top5.map((factor) => {
        const pct = (Math.abs(factor.impactScore) / maxScore) * 100;
        const color = getColor(Math.abs(factor.impactScore));
        return (
          <div key={factor.factorName}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-muted-foreground truncate max-w-[160px]">
                {factor.factorName}
              </span>
              <span className="text-xs font-bold" style={{ color }}>
                {factor.impactScore > 0 ? "+" : ""}
                {factor.impactScore.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: color,
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
