import { DASHBOARD_PALETTE } from "./chart-colors";

interface MiniSparklineProps {
  data: number[];
  color?: string;
}

export function MiniSparkline({
  data,
  color = DASHBOARD_PALETTE.blue,
}: MiniSparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 36;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="admin-kpi-card__sparkline"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polygon points={areaPoints} fill={color} fillOpacity={0.12} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
