/** Soft pastel palette inspired by overview dashboard reference */
export const DASHBOARD_PALETTE = {
  blue: "#6b9fd4",
  deepBlue: "#3e6d8e",
  teal: "#5babae",
  mint: "#7ccbc0",
  sage: "#a7c4bc",
  orange: "#f18f1c",
  amber: "#f59e0b",
  coral: "#e07a7a",
  rose: "#e2a9b9",
  sand: "#dbc4a1",
  slate: "#475569",
  cyan: "#5ec4c8",
} as const;

/** Chart series — bars, donuts, multi-series */
export const DASHBOARD_CHART_COLORS = [
  DASHBOARD_PALETTE.orange,
  DASHBOARD_PALETTE.deepBlue,
  DASHBOARD_PALETTE.mint,
  DASHBOARD_PALETTE.sage,
  DASHBOARD_PALETTE.sand,
  DASHBOARD_PALETTE.rose,
  DASHBOARD_PALETTE.teal,
  DASHBOARD_PALETTE.blue,
] as const;

/** Soft donut-friendly pastels */
export const DASHBOARD_DONUT_COLORS = [
  DASHBOARD_PALETTE.sand,
  DASHBOARD_PALETTE.sage,
  DASHBOARD_PALETTE.rose,
  DASHBOARD_PALETTE.deepBlue,
  DASHBOARD_PALETTE.orange,
  DASHBOARD_PALETTE.mint,
] as const;

export function chartColor(index: number): string {
  return DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length];
}

export function donutColor(index: number): string {
  return DASHBOARD_DONUT_COLORS[index % DASHBOARD_DONUT_COLORS.length];
}
