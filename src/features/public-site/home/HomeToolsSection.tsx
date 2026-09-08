import { useAuth } from "@/context/auth";
import { useLocale, usePublicCopy } from "@/context/locale";
import {
  HOME_PREVIEW_TOOL_SLUGS,
  getHomeToolsBySlugs,
  type ToolConfigEntry,
} from "@/features/tools/tool-config";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function toolHref(slug: string, canOpenTools: boolean) {
  return canOpenTools ? `/newsroom/tools/${slug}` : ROUTES.TOOLS_OVERVIEW;
}

function ToolPlate({
  tool,
  index,
  canOpenTools,
  label,
  description,
}: {
  tool: ToolConfigEntry;
  index: number;
  canOpenTools: boolean;
  label?: string;
  description?: string;
}) {
  const Icon = tool.icon;
  return (
    <Link to={toolHref(tool.slug, canOpenTools)} className="home-tools-plate">
      <span className="home-tools-plate__num" aria-hidden>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="home-tools-plate__icon" aria-hidden>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <h3 className="home-tools-plate__title">{label ?? tool.label}</h3>
      <p className="home-tools-plate__desc">{description ?? tool.description}</p>
    </Link>
  );
}

export function HomeToolsSection() {
  const { home } = usePublicCopy();
  const { dir } = useLocale();
  const { token, hasPermission } = useAuth();
  const canOpenTools = Boolean(token) && hasPermission(PERMISSIONS.ACCESS_TOOLS);
  const preview = getHomeToolsBySlugs(HOME_PREVIEW_TOOL_SLUGS);
  const Arrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="home-tools-bench" aria-labelledby="home-tools-title">
      <div className="container-page">
        <header className="home-tools-bench__head">
          <div className="home-tools-bench__copy">
            <h2 id="home-tools-title" className="home-tools-bench__title">
              {home.toolsTitle}
            </h2>
            <p className="home-tools-bench__lead">{home.toolsLead}</p>
          </div>
        </header>

        <div className="home-tools-bench__grid">
          {preview.map((tool, index) => (
            <ToolPlate
              key={tool.slug}
              tool={tool}
              index={index}
              canOpenTools={canOpenTools}
              label={
                tool.slug === "speech-to-text" ? home.toolsVoiceTitle : undefined
              }
              description={
                tool.slug === "speech-to-text" ? home.toolsVoiceLead : undefined
              }
            />
          ))}

          <Link
            to={ROUTES.TOOLS_OVERVIEW}
            className="home-tools-plate home-tools-plate--cta"
          >
            <span className="home-tools-plate__num" aria-hidden>
              +
            </span>
            <p className="home-tools-plate__title">{home.toolsCtaTitle}</p>
            <p className="home-tools-plate__desc">{home.toolsCtaLead}</p>
            <span className="home-tools-plate__cta">
              {home.toolsCta}
              <Arrow className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
