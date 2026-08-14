import { PERMISSIONS } from "@/router/permissions";
import { SmartEditor_APIs } from "@/services/api/tools";
import type {
  EditorialDetectResult,
  EditorialReviewSpan,
  EditorialRewriteSpan,
  SmartEditorResult,
} from "@/types";
import type { LucideIcon } from "lucide-react";
import { AlignLeft, Eraser, Languages, List } from "lucide-react";

export type SmartEditorSlug =
  | "fussha-rewriter"
  | "bias-neutralizer"
  | "discrimination-remover"
  | "bullet-points";

export type SmartEditorToolbarId = "fusha" | "bias" | "discrimination" | "bullets";

export type SmartEditorReviewSlug = "bias-neutralizer" | "discrimination-remover";

interface SmartEditorToolBase {
  slug: SmartEditorSlug;
  toolbarId: SmartEditorToolbarId;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: string;
}

export interface SmartEditorRewriteTool extends SmartEditorToolBase {
  kind: "rewrite";
  run: (text: string) => Promise<SmartEditorResult>;
}

export interface SmartEditorReviewTool extends SmartEditorToolBase {
  kind: "review";
  detectLabel: string;
  rewriteLabel: string;
  detect: (text: string) => Promise<EditorialDetectResult>;
  rewrite: (
    text: string,
    spans: EditorialRewriteSpan[],
  ) => Promise<SmartEditorResult>;
}

export type SmartEditorToolConfig = SmartEditorRewriteTool | SmartEditorReviewTool;

export function isReviewTool(
  tool: SmartEditorToolConfig,
): tool is SmartEditorReviewTool {
  return tool.kind === "review";
}

export function isReviewSlug(slug: SmartEditorSlug): slug is SmartEditorReviewSlug {
  return slug === "bias-neutralizer" || slug === "discrimination-remover";
}

export const SMART_EDITOR_TOOLS: SmartEditorToolConfig[] = [
  {
    kind: "rewrite",
    slug: "fussha-rewriter",
    toolbarId: "fusha",
    label: "إعادة صياغة فصحى",
    description: "تحسين الصياغة بالفصحى مع الحفاظ على المعنى",
    icon: Languages,
    permission: PERMISSIONS.RUN_FUSHA_REWRITER,
    run: SmartEditor_APIs.fushaRewriter,
  },
  {
    kind: "review",
    slug: "bias-neutralizer",
    toolbarId: "bias",
    label: "تحييد التحيز",
    detectLabel: "فحص التحيز",
    rewriteLabel: "إعادة صياغة المحدد",
    description: "كشف التحيز اللغوي ثم إعادة صياغة المقاطع المختارة فقط",
    icon: AlignLeft,
    permission: PERMISSIONS.RUN_BIAS_NEUTRALIZER,
    detect: SmartEditor_APIs.biasNeutralizer.detect,
    rewrite: SmartEditor_APIs.biasNeutralizer.rewrite,
  },
  {
    kind: "review",
    slug: "discrimination-remover",
    toolbarId: "discrimination",
    label: "إزالة التمييز",
    detectLabel: "فحص التمييز",
    rewriteLabel: "إعادة صياغة المحدد",
    description: "كشف التمييز ثم إعادة صياغة المقاطع المختارة فقط",
    icon: Eraser,
    permission: PERMISSIONS.RUN_DISCRIMINATION_REMOVER,
    detect: SmartEditor_APIs.discriminationRemover.detect,
    rewrite: SmartEditor_APIs.discriminationRemover.rewrite,
  },
  {
    kind: "rewrite",
    slug: "bullet-points",
    toolbarId: "bullets",
    label: "تلخيص نقاط",
    description: "تحويل النص إلى نقاط مختصرة واضحة",
    icon: List,
    permission: PERMISSIONS.RUN_BULLET_POINTS,
    run: SmartEditor_APIs.bulletPoints,
  },
];

export const SMART_EDITOR_SLUGS = new Set<string>(
  SMART_EDITOR_TOOLS.map((tool) => tool.slug),
);

export function isSmartEditorSlug(slug: string): slug is SmartEditorSlug {
  return SMART_EDITOR_SLUGS.has(slug);
}

export function getSmartEditorBySlug(
  slug: SmartEditorSlug,
): SmartEditorToolConfig {
  const tool = SMART_EDITOR_TOOLS.find((entry) => entry.slug === slug);
  if (!tool) throw new Error(`Unknown smart editor slug: ${slug}`);
  return tool;
}

export function getSmartEditorByToolbarId(
  toolbarId: SmartEditorToolbarId,
): SmartEditorToolConfig {
  const tool = SMART_EDITOR_TOOLS.find((entry) => entry.toolbarId === toolbarId);
  if (!tool) throw new Error(`Unknown smart editor toolbar id: ${toolbarId}`);
  return tool;
}

export type { EditorialReviewSpan };
