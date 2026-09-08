import { useAuth } from "@/context/auth";
import { useLocale, usePublicCopy } from "@/context/locale";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  TOOL_REGISTRY,
  type ToolCategory,
  type ToolConfigEntry,
} from "@/features/tools/tool-config";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

const CATEGORY_ORDER: ToolCategory[] = [
  "image",
  "editorial",
  "voice",
  "editor",
];

const CATEGORY_LABELS_EN: Record<ToolCategory, string> = {
  editor: "Editing",
  voice: "Voice",
  editorial: "Editorial",
  image: "Images & sources",
};

const CATEGORY_DESCRIPTIONS_EN: Record<ToolCategory, string> = {
  editor: "Sharpen wording before a story goes out",
  voice: "Transcribe, generate, and keep audio in the library",
  editorial: "Standards, credibility, and local voice",
  image: "Check pictures and the sites they come from",
};

function toolHref(slug: string, canOpenTools: boolean) {
  return canOpenTools ? `/newsroom/tools/${slug}` : ROUTES.LOGIN;
}

export default function ToolsOverviewPage() {
  const { toolsPage } = usePublicCopy();
  const { locale, dir } = useLocale();
  const { token, hasPermission } = useAuth();
  const canOpenTools = Boolean(token) && hasPermission(PERMISSIONS.ACCESS_TOOLS);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  const labels = locale === "en" ? CATEGORY_LABELS_EN : CATEGORY_LABELS;
  const descriptions =
    locale === "en" ? CATEGORY_DESCRIPTIONS_EN : CATEGORY_DESCRIPTIONS;

  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        label: labels[category],
        description: descriptions[category],
        tools: TOOL_REGISTRY.filter((tool) => tool.category === category),
      })).filter((group) => group.tools.length > 0),
    [descriptions, labels],
  );

  let runningIndex = 0;

  return (
    <div className="tools-folio">
      <header className="tools-folio__intro">
        <div className="container-page">
          <h1 className="tools-folio__title">{toolsPage.title}</h1>
          <div className="tools-folio__meta">
            <p className="tools-folio__lead">{toolsPage.lead}</p>
            <span className="tools-folio__count">
              {toolsPage.count(TOOL_REGISTRY.length)}
            </span>
          </div>
        </div>
      </header>

      <div className="container-page tools-folio__body">
        {groups.map((group, groupIndex) => (
          <section
            key={group.category}
            className="tools-folio__chapter"
            aria-labelledby={`tools-group-${group.category}`}
            style={{ animationDelay: `${120 + groupIndex * 90}ms` }}
          >
            <header className="tools-folio__chapter-head">
              <span className="tools-folio__chapter-mark" aria-hidden>
                {String(groupIndex + 1).padStart(2, "0")}
              </span>
              <div>
                <h2
                  id={`tools-group-${group.category}`}
                  className="tools-folio__chapter-title"
                >
                  {group.label}
                </h2>
                <p className="tools-folio__chapter-lead">{group.description}</p>
              </div>
            </header>

            <div className="tools-folio__grid">
              {group.tools.map((tool) => {
                const index = runningIndex;
                runningIndex += 1;
                return (
                  <ToolCard
                    key={tool.slug}
                    tool={tool}
                    index={index}
                    canOpenTools={canOpenTools}
                    openLabel={toolsPage.openTool}
                    Arrow={Arrow}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  index,
  canOpenTools,
  openLabel,
  Arrow,
}: {
  tool: ToolConfigEntry;
  index: number;
  canOpenTools: boolean;
  openLabel: string;
  Arrow: typeof ArrowLeft;
}) {
  const Icon = tool.icon;
  return (
    <Link
      to={toolHref(tool.slug, canOpenTools)}
      className="tools-folio-card"
      style={{ animationDelay: `${180 + index * 70}ms` }}
    >
      <span className="tools-folio-card__icon" aria-hidden>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="tools-folio-card__title">{tool.label}</h3>
      <p className="tools-folio-card__desc">{tool.description}</p>
      <span className="tools-folio-card__open">
        {openLabel}
        <Arrow className="size-4" />
      </span>
    </Link>
  );
}
