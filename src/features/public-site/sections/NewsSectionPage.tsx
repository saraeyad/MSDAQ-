import { Sparkles } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import {
  STATIC_SECTION_BY_PATH,
  type StaticSectionConfig,
} from "@/features/public-site/sections/news-sections";

function StaticSectionContent({ config }: { config: StaticSectionConfig }) {
  const Icon = config.icon;

  return (
    <div className="pb-16">
      <section className="border-b border-border bg-gradient-to-bl from-muted/50 via-card to-card py-12 md:py-16">
        <div className="container-page">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
            <Icon className="size-3.5" />
            {config.badge}
          </span>
          <h1 className="mt-4 font-headline text-3xl font-bold md:text-4xl">
            {config.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
            {config.description}
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Sparkles className="mx-auto size-8 text-primary" />
          <p className="mt-4 font-headline text-lg font-semibold">
            قريباً — محتوى جديد
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            نعمل على إعداد محتوى لهذا القسم.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function NewsSectionPage() {
  const { pathname } = useLocation();
  const config = STATIC_SECTION_BY_PATH[pathname];

  if (!config) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <StaticSectionContent config={config} />;
}
