interface PublicPageHeroProps {
  title: string;
  description?: string;
}

export function PublicPageHero({ title, description }: PublicPageHeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-bl from-muted/50 via-card to-card py-12 md:py-16">
      <div className="container-page">
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
