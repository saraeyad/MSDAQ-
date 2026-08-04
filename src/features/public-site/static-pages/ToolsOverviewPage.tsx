import { Card, CardContent } from "@/components/ui/card";
import { Shield, Search, Image, Globe, Mic } from "lucide-react";

const TOOLS = [
  {
    icon: Shield,
    title: "التحقق من المصداقية",
    description: "نتحقق داخلياً من كل ادعاء قبل النشر — لا تظهر الدرجات للقراء.",
  },
  {
    icon: Image,
    title: "البحث العكسي عن الصور",
    description: "نتحقق من مصدر الصور وتاريخ ظهورها على الإنترنت.",
  },
  {
    icon: Search,
    title: "كشف الصور المُولَّدة بالذكاء الاصطناعي",
    description: "نفحص الصور بحثاً عن علامات التلاعب أو التوليد الآلي.",
  },
  {
    icon: Globe,
    title: "فحص سمعة النطاقات",
    description: "نراجع مصداقية المواقع قبل الاعتماد عليها كمصادر.",
  },
  {
    icon: Mic,
    title: "أدوات الصوت",
    description: "تحويل الصوت إلى نص والنص إلى صوت لدعم المحتوى الصوتي.",
  },
];

export default function ToolsOverviewPage() {
  return (
    <div className="container-page py-10">
      <h1 className="section-title">أدوات التحقق</h1>
      <p className="section-description">
        تستخدم CDMC أدوات تحقق متقدمة داخلياً لضمان جودة المحتوى المنشور.
        هذه الأدوات متاحة لفريق التحرير فقط ولا تظهر للقراء.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Card key={tool.title} className="content-card">
            <CardContent className="p-6">
              <tool.icon className="size-8 text-primary" />
              <h3 className="mt-4 font-headline text-lg font-semibold">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {tool.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
