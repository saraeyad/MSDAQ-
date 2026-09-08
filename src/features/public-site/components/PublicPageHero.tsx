interface PublicPageHeroProps {
  title: string;
  description?: string;
  kicker?: string;
}

export function PublicPageHero({
  title,
  description,
  kicker,
}: PublicPageHeroProps) {
  return (
    <section className="public-page-hero py-12 md:py-16">
      <div className="container-page">
        {kicker ? (
          <p className="public-page-hero__kicker">{kicker}</p>
        ) : null}
        <h1 className="font-headline text-3xl font-bold md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
