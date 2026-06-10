export const DOMAIN_BORDER_ACCENTS = [
  "border-s-accent-investigation",
  "border-s-accent-editor-secondary",
  "border-s-accent-editor",
  "border-s-secondary",
  "border-s-accent-chart-rose",
  "border-s-accent-chart-sky",
] as const;

export const DOMAIN_TEXT_ACCENTS = [
  "text-accent-investigation",
  "text-accent-editor-secondary",
  "text-accent-editor",
  "text-secondary",
  "text-accent-chart-rose",
  "text-accent-chart-sky",
] as const;

export const LEGEND_ACCENT_CLASSES = {
  editor: {
    color: "text-accent-editor",
    bg: "bg-accent-editor/10",
    border: "border-s-accent-editor",
  },
  editorSecondary: {
    color: "text-accent-editor-secondary",
    bg: "bg-accent-editor-secondary/10",
    border: "border-s-accent-editor-secondary",
  },
  investigation: {
    color: "text-accent-investigation",
    bg: "bg-accent-investigation/10",
    border: "border-s-accent-investigation",
  },
  chartRose: {
    color: "text-accent-chart-rose",
    bg: "bg-accent-chart-rose/10",
    border: "border-s-accent-chart-rose",
  },
} as const;
