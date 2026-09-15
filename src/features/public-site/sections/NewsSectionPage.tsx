import { usePublicCopy } from "@/context/locale";
import { Sparkles } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/router/routes";

export default function NewsSectionPage() {
  const { pathname } = useLocation();
  const { staticSections, sectionPages } = usePublicCopy();
  const section = staticSections.find((entry) => entry.path === pathname);

  if (!section) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="pb-16">
      <section className="border-b border-border bg-gradient-to-bl from-muted/50 via-card to-card py-12 md:py-16">
        <div className="container-page">
          <h1 className="font-headline text-3xl font-bold md:text-4xl">
            {section.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
            {section.description}
          </p>
        </div>
      </section>

      <section className="container-page py-10 md:py-14">
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <Sparkles className="mx-auto size-8 text-primary" />
          <p className="mt-4 font-headline text-lg font-semibold">
            {sectionPages.comingTitle}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {sectionPages.comingLead}
          </p>
        </div>
      </section>
    </div>
  );
}
