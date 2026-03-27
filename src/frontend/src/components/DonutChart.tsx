interface DonutChartProps {
  debtRatio: number;
}

export function DonutChart({ debtRatio }: DonutChartProps) {
  const pct = Math.max(0, Math.min(100, debtRatio));
  const other = 100 - pct;

  const r = 52;
  const cx = 70;
  const cy = 70;
  const circumference = 2 * Math.PI * r;

  const debtDash = (pct / 100) * circumference;
  const otherDash = (other / 100) * circumference;

  const getRating = (ratio: number) => {
    if (ratio < 20) return { label: "Excellent", color: "#2F7D4C" };
    if (ratio < 36) return { label: "Good", color: "#0F5C6B" };
    if (ratio < 50) return { label: "Fair", color: "#d97706" };
    return { label: "High Risk", color: "#dc2626" };
  };

  const rating = getRating(pct);

  return (
    <div className="flex items-center gap-4">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        role="img"
        aria-label={`Debt-to-income ratio donut chart showing ${Math.round(pct)}% - ${rating.label}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#E5EAF0"
          strokeWidth="18"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={rating.color}
          strokeWidth="18"
          strokeDasharray={`${debtDash} ${otherDash}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill={rating.color}
          fontFamily="Inter, sans-serif"
        >
          {Math.round(pct)}%
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="9"
          fill="#6B7280"
          fontFamily="Inter, sans-serif"
        >
          Debt/Income
        </text>
      </svg>
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: rating.color }}
          />
          <span className="font-medium text-foreground">
            Debt ({Math.round(pct)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-muted flex-shrink-0" />
          <span className="text-muted-foreground">
            Remaining ({Math.round(other)}%)
          </span>
        </div>
        <div
          className="mt-1 px-2 py-1 rounded text-xs font-semibold"
          style={{ backgroundColor: `${rating.color}20`, color: rating.color }}
        >
          {rating.label}
        </div>
      </div>
    </div>
  );
}
