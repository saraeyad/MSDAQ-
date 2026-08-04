import { PartnerLogo } from "@/features/public-site/partners/PartnerLogo";
import { FEATURED_PARTNERS } from "@/features/public-site/partners/data/partners";

export function PartnersStrip() {
  return (
    <section className="partners-strip">
      <div className="partners-strip__inner container-page">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary">شركاؤنا</span>
          <h2 className="partners-strip__heading font-headline text-foreground">
            نعمل مع مؤسسات دولية ومحلية
          </h2>
        </div>

        <div className="partners-strip__logos">
          {FEATURED_PARTNERS.map((partner) => (
            <div key={partner.id} className="partners-strip__logo-cell">
              <PartnerLogo partner={partner} size="strip" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
