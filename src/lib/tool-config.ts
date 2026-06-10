import { ROUTES } from "@/router/routes";
import type { LucideIcon } from "lucide-react";
import { PenLine, ScanSearch, Search } from "lucide-react";

export type PublicToolId = "credibility" | "smartEditor" | "imageTrace";

export type PublicToolAccent = {
  strip: string;
  glow: string;
  hoverGlow: string;
  orb: string;
  border: string;
  bg: string;
  text: string;
  dot: string;
};

export type PublicTool = {
  id: PublicToolId;
  step: 1 | 2 | 3;
  icon: LucideIcon;
  accent: PublicToolAccent;
  gradientClass: string;
  portalHoverClass: string;
  i18n: {
    title: string;
    description: string;
    cta: string;
    badge: string;
    workflowVerb: string;
    workflowLabel: string;
  };
  getPath: (ctx: { isJournalist: boolean }) => string;
};

export const PUBLIC_TOOLS: PublicTool[] = [
  {
    id: "credibility",
    step: 1,
    icon: Search,
    accent: {
      strip: "bg-secondary",
      glow: "shadow-glow-secondary",
      hoverGlow: "hover:shadow-glow-secondary",
      orb: "bg-secondary/20",
      border: "border-secondary/40",
      bg: "bg-secondary/10",
      text: "text-secondary",
      dot: "bg-secondary",
    },
    gradientClass: "from-secondary-muted via-white to-background",
    portalHoverClass: "group-hover:from-secondary-muted/90 group-hover:via-secondary-muted/80 group-hover:to-background/90",
    i18n: {
      title: "home.tools.credibility.title",
      description: "home.tools.credibility.description",
      cta: "home.tools.credibility.cta",
      badge: "home.tools.credibility.badge",
      workflowVerb: "home.showcase.verbs.investigate",
      workflowLabel: "home.showcase.steps.credibility",
    },
    getPath: () => ROUTES.CREDIBILITY,
  },
  {
    id: "smartEditor",
    step: 2,
    icon: PenLine,
    accent: {
      strip: "bg-accent-editor",
      glow: "shadow-glow-editor",
      hoverGlow: "hover:shadow-glow-editor",
      orb: "bg-accent-editor/20",
      border: "border-accent-editor/40",
      bg: "bg-accent-editor/10",
      text: "text-accent-editor",
      dot: "bg-accent-editor",
    },
    gradientClass: "from-accent-editor-muted via-white to-accent-editor-secondary-muted",
    portalHoverClass: "group-hover:from-accent-editor-muted/90 group-hover:via-accent-editor-subtle/80 group-hover:to-accent-editor-secondary-muted/90",
    i18n: {
      title: "home.tools.editor.title",
      description: "home.tools.editor.description",
      cta: "home.tools.editor.cta",
      badge: "home.tools.editor.badge",
      workflowVerb: "home.showcase.verbs.verify",
      workflowLabel: "home.showcase.steps.standards",
    },
    getPath: ({ isJournalist }) =>
      isJournalist ? ROUTES.JOURNALIST_EDITOR : ROUTES.SMART_EDITOR_DEMO,
  },
  {
    id: "imageTrace",
    step: 3,
    icon: ScanSearch,
    accent: {
      strip: "bg-accent-investigation",
      glow: "shadow-glow-investigation",
      hoverGlow: "hover:shadow-glow-investigation",
      orb: "bg-accent-investigation/20",
      border: "border-accent-investigation/40",
      bg: "bg-accent-investigation/10",
      text: "text-accent-investigation",
      dot: "bg-accent-investigation",
    },
    gradientClass: "from-accent-investigation-muted via-white to-accent-admin-muted",
    portalHoverClass: "group-hover:from-accent-investigation-muted/90 group-hover:via-accent-investigation-subtle/80 group-hover:to-accent-admin-muted/90",
    i18n: {
      title: "home.tools.imageTrace.title",
      description: "home.tools.imageTrace.description",
      cta: "home.tools.imageTrace.cta",
      badge: "home.tools.imageTrace.badge",
      workflowVerb: "home.showcase.verbs.trace",
      workflowLabel: "home.showcase.steps.image",
    },
    getPath: () => ROUTES.IMAGE_VERIFICATION,
  },
];

export function isPublicToolPath(pathname: string): boolean {
  return PUBLIC_TOOLS.some((tool) => {
    const p = tool.getPath({ isJournalist: false });
    return pathname === p || pathname.startsWith(`${p}/`);
  }) || pathname === ROUTES.JOURNALIST_EDITOR;
}
