import { ROUTES } from "@/router/routes";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Database, Eye, FileText } from "lucide-react";

/** Static editorial pages — not backed by GET /api/public/categories. */
export interface StaticSectionConfig {
  path: string;
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}

export const STATIC_SECTIONS: StaticSectionConfig[] = [
  {
    path: ROUTES.RUYA,
    title: "رؤيا",
    description:
      "تحليلات وتقديرات موقف — رؤى تحريرية حول الأحداث والاتجاهات الإعلامية.",
    badge: "رؤيا",
    icon: Eye,
  },
  {
    path: ROUTES.PUBLICATIONS,
    title: "إصدارات ودراسات",
    description:
      "تقارير ودراسات منشورة — أبحاث CDMC حول المعلومات المضللة والإعلام.",
    badge: "دراسات",
    icon: FileText,
  },
  {
    path: ROUTES.PUBLICATIONS_REPORTS,
    title: "تقارير",
    description:
      "تقارير تحريرية وبحثية — رصد وتحليل للأحداث والظواهر الإعلامية.",
    badge: "تقارير",
    icon: FileText,
  },
  {
    path: ROUTES.PUBLICATIONS_BOOKS,
    title: "كتب",
    description:
      "إصدارات وكتب منشورة — مطبوعات CDMC وشركائنا في مجال التحقق والإعلام.",
    badge: "كتب",
    icon: BookOpen,
  },
  {
    path: ROUTES.DATA_INFO,
    title: "معلومات وبيانات",
    description:
      "بيانات ومعلومات موثقة — أرقام، إحصاءات، وملفات معلوماتية للصحفيين والباحثين.",
    badge: "بيانات",
    icon: Database,
  },
];

export const STATIC_SECTION_BY_PATH = Object.fromEntries(
  STATIC_SECTIONS.map((section) => [section.path, section]),
) as Record<string, StaticSectionConfig>;
