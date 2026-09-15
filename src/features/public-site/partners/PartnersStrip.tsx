import { PartnerLogo } from "@/features/public-site/partners/PartnerLogo";
import { partnersFromCopy } from "@/features/public-site/partners/data/partners";
import { usePublicCopy } from "@/context/locale";

export function PartnersStrip() {
  const { partnersStrip, partnersList } = usePublicCopy();
  const partners = partnersFromCopy(partnersList);

  return (
    <section className="partners-strip">
      <div className="partners-strip__inner container-page">
        <div className="text-center">
          <span className="text-sm font-semibold text-primary">
            {partnersStrip.kicker}
          </span>
          <h2 className="partners-strip__heading font-headline text-foreground">
            {partnersStrip.heading}
          </h2>
        </div>

        <div className="partners-strip__logos">
          {partners.map((partner) => (
            <div key={partner.id} className="partners-strip__logo-cell">
              <PartnerLogo partner={partner} size="strip" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
