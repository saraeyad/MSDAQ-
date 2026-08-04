import { CenterDefinitionSection } from "@/features/public-site/about/CenterDefinitionSection";
import { PublicPageHero } from "@/features/public-site/components/PublicPageHero";

export default function AboutPage() {
  return (
    <div className="pb-16">
      <PublicPageHero
        badge="عن المركز"
        badgeAlign="start"
        title="من نحن"
        description="مركز الإعلام المجتمعي (CDMC) منصة إعلامية موثوقة تمكّن المجتمع والصحفيين من مواجهة المعلومات المضللة."
      />

      <CenterDefinitionSection />

      <section className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>
            يعمل المركز على بناء قدرات الصحفيين والنشطاء في مجال التحقق من
            الأخبار، وتقديم محتوى إعلامي موثوق يخدم المجتمع الفلسطيني، وخصوصاً
            في غزة.
          </p>
          <p>
            من خلال برامج تدريبية وورش عمل ومبادرات مجتمعية، نسعى إلى تعزيز
            الوعي الإعلامي ومكافحة التضليل عبر أدوات تحقق حديثة وشراكات مع
            مؤسسات محلية ودولية.
          </p>
        </div>
      </section>
    </div>
  );
}
