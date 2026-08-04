interface PublicPageHeroProps {
  badge?: string;
  /** RTL: start = right edge */
  badgeAlign?: "center" | "start";
  title: string;
  description?: string;
}

export function PublicPageHero({
  badge,
  badgeAlign = "center",
  title,
  description,
}: PublicPageHeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-bl from-muted/50 via-card to-card py-12 md:py-16">
      <div className="container-page text-center">
        {badge ? (
          <div className={badgeAlign === "start" ? "text-start" : undefined}>
            <span className="text-sm font-semibold text-primary">{badge}</span>
          </div>
        ) : null}
        <h1 className="mt-2 font-headline text-3xl font-bold md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
