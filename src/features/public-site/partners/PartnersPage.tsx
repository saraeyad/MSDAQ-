import { PartnerLogo } from "@/features/public-site/partners/PartnerLogo";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import type { Partner } from "@/features/public-site/partners/data/partners";
import { partnersFromCopy } from "@/features/public-site/partners/data/partners";
import { usePublicCopy } from "@/context/locale";

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="partners-page-card">
      <div className="partners-page-card__logo">
        <PartnerLogo partner={partner} size="card" />
      </div>
      <h3 className="partners-page-card__title">{partner.title}</h3>
    </article>
  );
}

export default function PartnersPage() {
  const { partnersPage, partnersList } = usePublicCopy();
  const partners = partnersFromCopy(partnersList);

  return (
    <div className="partners-page">
      <PublicPageHero
        title={partnersPage.title}
        description={partnersPage.description}
      />

      <section className="container-page py-10 md:py-14">
        <div className="partners-page-grid">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      <section className="partners-page-footer-note">
        <div className="container-page">
          <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            {partnersPage.footerNote}
          </p>
        </div>
      </section>
    </div>
  );
}
