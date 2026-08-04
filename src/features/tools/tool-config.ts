import { PERMISSIONS } from "@/router/routes";
import { SMART_EDITOR_TOOLS } from "@/features/tools/smart-editor/config";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileText,
  Globe,
  Image,
  Languages,
  Mic,
  Search,
  Shield,
  Volume2,
} from "lucide-react";

export type ToolCategory = "editor" | "voice" | "editorial" | "image";

export interface ToolConfigEntry {
  slug: string;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: string;
  category: ToolCategory;
}

const EDITOR_TOOLS: ToolConfigEntry[] = SMART_EDITOR_TOOLS.map((tool) => ({
  slug: tool.slug,
  label: tool.label,
  description: tool.description,
  icon: tool.icon,
  permission: tool.permission,
  category: "editor" as const,
}));

export const TOOL_REGISTRY: ToolConfigEntry[] = [
  ...EDITOR_TOOLS,
  {
    slug: "text-to-speech",
    label: "تحويل النص إلى صوت",
    description: "توليد ملف صوتي من نص مكتوب",
    icon: Volume2,
    permission: PERMISSIONS.RUN_TEXT_TO_VOICE,
    category: "voice",
  },
  {
    slug: "speech-to-text",
    label: "تحويل الصوت إلى نص",
    description: "تفريغ تسجيل صوتي إلى نص قابل للتحرير",
    icon: Mic,
    permission: PERMISSIONS.RUN_VOICE_TO_TEXT,
    category: "voice",
  },
  {
    slug: "generated-audios",
    label: "مكتبة الملفات الصوتية",
    description: "تصفّح الملفات الصوتية المحفوظة في المكتبة",
    icon: Volume2,
    permission: PERMISSIONS.RUN_TEXT_TO_VOICE,
    category: "voice",
  },
  {
    slug: "transcripts",
    label: "مكتبة النصوص المفرغة",
    description: "تصفّح النصوص المفرغة المحفوظة في المكتبة",
    icon: FileText,
    permission: PERMISSIONS.RUN_VOICE_TO_TEXT,
    category: "voice",
  },
  {
    slug: "standards-check",
    label: "فحص المعايير",
    description: "التزام النص بمعايير الفصحى التحريرية",
    icon: Shield,
    permission: PERMISSIONS.RUN_STANDARDS_CHECK,
    category: "editorial",
  },
  {
    slug: "credibility-check",
    label: "فحص المصداقية",
    description: "التحقق من ادعاءات النص مقابل مصادر موثوقة",
    icon: BookOpen,
    permission: PERMISSIONS.RUN_CREDIBILITY_CHECK,
    category: "editorial",
  },
  {
    slug: "localization",
    label: "التبسيط واللهجة",
    description: "تبسيط النص أو توطينه بلهجة محلية",
    icon: Languages,
    permission: PERMISSIONS.RUN_LOCALIZATION,
    category: "editorial",
  },
  {
    slug: "reverse-image",
    label: "بحث عكسي عن الصور",
    description: "تتبّع مصدر الصورة وتاريخ ظهورها",
    icon: Search,
    permission: PERMISSIONS.RUN_REVERSE_IMAGE_SEARCH,
    category: "image",
  },
  {
    slug: "ai-detection",
    label: "كشف الصور بالذكاء الاصطناعي",
    description: "كشف ما إذا كانت الصورة مُولَّدة أو مُعدَّلة بالذكاء الاصطناعي",
    icon: Image,
    permission: PERMISSIONS.RUN_AI_IMAGE_DETECTION,
    category: "image",
  },
  {
    slug: "domain-checker",
    label: "فحص النطاق",
    description: "مراجعة سمعة ومصداقية المواقع قبل الاعتماد عليها",
    icon: Globe,
    permission: PERMISSIONS.CHECK_DOMAINS,
    category: "image",
  },
];

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  editor: "أدوات التحرير",
  voice: "أدوات الصوت",
  editorial: "أدوات تحريرية",
  image: "أدوات الصور والتحقق",
};

export const CATEGORY_DESCRIPTIONS: Record<ToolCategory, string> = {
  editor: "صقل النص وتحسين الصياغة قبل النشر",
  voice: "تفريغ الصوت، توليده، وإدارته في المكتبة",
  editorial: "فحوصات تحريرية وتوطين المحتوى",
  image: "التحقق من الصور والمصادر الرقمية",
};

export function getToolBySlug(slug: string | undefined): ToolConfigEntry | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}
