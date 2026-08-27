import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes";
import { ArrowLeft, BadgeCheck, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/images/hero-verification.png";

export function HomeHero() {
  return (
    <section className="container-page py-10 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            التحقق قبل النشر
          </p>

          <h1 className="mt-4 font-headline text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            نُمكّن الصحفيين من التحقق من{" "}
            <span className="text-primary">الأخبار</span> قبل النشر
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            يجمع صبارة بوست بين الإعلام والتكنولوجيا والتنمية المجتمعية لتوفير
            أدوات مجانية وتدريب لمكافحة المعلومات المضللة.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={ROUTES.TOOLS_OVERVIEW}>
                <Shield className="size-4" />
                أدوات التحقق
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={ROUTES.ARTICLES}>
                مقالاتنا
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" />
              أدوات مجانية
            </span>
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" />
              دعم للباحثين
            </span>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/40 p-2 shadow-sm">
            <img
              src={HERO_IMAGE}
              alt="منصة التحقق من الأخبار — صحفي يعمل على التحقق من المعلومات"
              className="w-full rounded-xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
