import { Decision } from "../backend";

interface GaugeChartProps {
  likelihood: number;
  decision: Decision;
}

const decisionConfig = {
  [Decision.approved]: {
    label: "Approved",
    color: "#2F7D4C",
    bg: "#dcfce7",
    text: "#166534",
  },
  [Decision.underReview]: {
    label: "Under Review",
    color: "#d97706",
    bg: "#fef3c7",
    text: "#92400e",
  },
  [Decision.denied]: {
    label: "Denied",
    color: "#dc2626",
    bg: "#fee2e2",
    text: "#991b1b",
  },
};

export function GaugeChart({ likelihood, decision }: GaugeChartProps) {
  const config = decisionConfig[decision];
  const pct = Math.max(0, Math.min(100, likelihood));

  const r = 80;
  const cx = 100;
  const cy = 100;
  const circumference = Math.PI * r;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const trackD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width="220"
          height="130"
          viewBox="0 0 200 115"
          className="overflow-visible"
          role="img"
          aria-label={`Approval likelihood gauge showing ${Math.round(pct)}% - ${config.label}`}
        >
          <path
            d={trackD}
            fill="none"
            stroke="#E5EAF0"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d={trackD}
            fill="none"
            stroke={config.color}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="32"
            fontWeight="800"
            fill={config.color}
            fontFamily="Inter, sans-serif"
          >
            {Math.round(pct)}%
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            fontSize="11"
            fill="#6B7280"
            fontFamily="Inter, sans-serif"
          >
            Approval Likelihood
          </text>
          <text
            x={cx - r - 6}
            y={cy + 4}
            textAnchor="end"
            fontSize="9"
            fill="#9CA3AF"
            fontFamily="Inter, sans-serif"
          >
            0%
          </text>
          <text
            x={cx + r + 6}
            y={cy + 4}
            textAnchor="start"
            fontSize="9"
            fill="#9CA3AF"
            fontFamily="Inter, sans-serif"
          >
            100%
          </text>
        </svg>
      </div>
      <span
        className="px-4 py-1.5 rounded-full text-sm font-semibold"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {config.label}
      </span>
    </div>
  );
}
