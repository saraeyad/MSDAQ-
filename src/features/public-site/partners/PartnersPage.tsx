import { PartnerLogo } from "@/features/public-site/partners/PartnerLogo";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";
import type { Partner } from "@/features/public-site/partners/data/partners";
import { ALL_PARTNERS } from "@/features/public-site/partners/data/partners";

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
  return (
    <div className="partners-page pb-16">
      <PublicPageHero
        badge="عن المركز"
        title="شركاؤنا"
        description="شراكات استراتيجية مع مؤسسات دولية ومحلية تدعم عملنا في التحقق الإعلامي وتمكين المجتمع."
      />

      <section className="container-page py-10 md:py-14">
        <div className="partners-page-grid">
          {ALL_PARTNERS.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      <section className="partners-page-footer-note">
        <div className="container-page">
          <p className="text-center text-sm leading-relaxed text-muted-foreground md:text-base">
            للاستفسار عن الشراكات أو التعاون المؤسسي، تواصل معنا عبر صفحة
            المركز.
          </p>
        </div>
      </section>
    </div>
  );
}
