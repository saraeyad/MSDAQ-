import { Button } from "@/components/ui/button";
import { ROUTES } from "@/router/routes";
import {
  ArrowLeft,
  Globe,
  Image,
  Mic,
  Search,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

const TOOLS = [
  {
    icon: Shield,
    title: "التحقق من المصداقية",
    description: "نتحقق من كل ادعاء قبل النشر باستخدام مصادر موثوقة.",
  },
  {
    icon: Image,
    title: "البحث العكسي عن الصور",
    description: "تتبع أصل الصور المتداولة والتحقق من تاريخ ظهورها.",
  },
  {
    icon: Search,
    title: "كشف الصور المُولَّدة بالذكاء الاصطناعي",
    description: "فحص الصور بحثاً عن علامات التلاعب أو التوليد الآلي.",
  },
  {
    icon: Globe,
    title: "فحص سمعة النطاقات",
    description: "مراجعة مصداقية المواقع قبل الاعتماد عليها كمصادر.",
  },
  {
    icon: Mic,
    title: "أدوات الصوت",
    description: "تحويل الصوت إلى نص والنص إلى صوت للمحتوى الصوتي.",
  },
];

export function HomeToolsSection() {
  return (
    <section className="home-tools-section py-16 md:py-24">
      <div className="container-page">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight md:text-3xl lg:text-[2rem]">
            أدواتنا للتحقق من الأخبار
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            يستخدم فريق صبارة بوست أدوات متقدمة لضمان جودة المحتوى المنشور —
            من تحليل الصور إلى فحص المصداقية.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {TOOLS.map((tool) => (
            <article key={tool.title} className="home-tools-card">
              <span className="home-tools-card__icon">
                <tool.icon className="size-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 font-headline text-lg font-bold leading-snug text-foreground">
                {tool.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {tool.description}
              </p>
            </article>
          ))}

          <article className="home-tools-cta sm:col-span-2 lg:col-span-1">
            <p className="font-headline text-xl font-bold text-foreground">
              المزيد من الأدوات
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              اكتشف كل أدوات التحقق المتاحة في المنصة
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link to={ROUTES.TOOLS_OVERVIEW}>
                استكشف الأدوات
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
