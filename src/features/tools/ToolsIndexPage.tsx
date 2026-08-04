import { useAuth } from "@/context/auth";
import { ROUTES } from "@/router/routes";
import { ArrowLeft, Sparkles, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolConfigEntry,
} from "./tool-config";

const CATEGORY_ORDER: ToolCategory[] = [
  "editor",
  "voice",
  "editorial",
  "image",
];

function ToolCard({
  tool,
  category,
}: {
  tool: ToolConfigEntry;
  category: ToolCategory;
}) {
  const Icon = tool.icon;

  return (
    <Link
      to={ROUTES.NEWSROOM_TOOL.replace(":tool", tool.slug)}
      className="newsroom-tools-card group"
      data-category={category}
    >
      <span className="newsroom-tools-card__icon" aria-hidden>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="newsroom-tools-card__body">
        <h4 className="newsroom-tools-card__title">{tool.label}</h4>
        <p className="newsroom-tools-card__desc">{tool.description}</p>
      </div>
      <span className="newsroom-tools-card__arrow" aria-hidden>
        <ArrowLeft className="size-4" />
      </span>
    </Link>
  );
}

export default function ToolsIndexPage() {
  const { hasPermission } = useAuth();
  const visibleTools = TOOL_REGISTRY.filter((tool) =>
    hasPermission(tool.permission),
  );

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    description: CATEGORY_DESCRIPTIONS[category],
    tools: visibleTools.filter((t) => t.category === category),
  })).filter((g) => g.tools.length > 0);

  return (
    <div className="newsroom-tools-page space-y-10">
      <header className="newsroom-tools-hero">
        <div className="newsroom-tools-hero__glow" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <span className="newsroom-tools-hero__badge">
              <Sparkles className="size-3.5" />
              غرفة الأخبار
            </span>
            <div>
              <h2 className="section-title">أدوات التحرير</h2>
              <p className="section-description">
                نفس الأدوات المستخدمة في مسار النشر — متاحة بشكل مستقل حسب
                صلاحياتك
              </p>
            </div>
          </div>
          {visibleTools.length > 0 && (
            <div className="newsroom-tools-hero__stat">
              <Wrench className="size-4 text-primary" />
              <span>
                <strong>{visibleTools.length.toLocaleString("ar")}</strong> أداة
                متاحة
              </span>
            </div>
          )}
        </div>
      </header>

      {grouped.length === 0 ? (
        <div className="newsroom-tools-empty">
          <Wrench className="size-10 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="mt-4 font-medium text-foreground">
            لا توجد أدوات متاحة لحسابك
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            تواصل مع المسؤول إذا كنت تحتاج صلاحيات إضافية
          </p>
        </div>
      ) : (
        grouped.map((group) => (
          <section
            key={group.category}
            className="newsroom-tools-section"
            data-category={group.category}
          >
            <div className="newsroom-tools-section__header">
              <div>
                <h3 className="newsroom-tools-section__title">{group.label}</h3>
                <p className="newsroom-tools-section__desc">
                  {group.description}
                </p>
              </div>
              <span className="newsroom-tools-section__count">
                {group.tools.length.toLocaleString("ar")}
              </span>
            </div>
            <div className="newsroom-tools-grid">
              {group.tools.map((tool) => (
                <ToolCard
                  key={tool.slug}
                  tool={tool}
                  category={group.category}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
