import type { Article } from "@/types/article";

export const MOCK_ARTICLES: Record<number, Article> = {
  1: {
    id: 1,
    title: "تحقيق استقصائي: كشف شبكات التضليل الرقمي في الحملات الانتخابية الأخيرة",
    author: "سارة المنصور",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    publishedAt: "2024-10-14T10:00:00Z",
    readingTimeMinutes: 12,
    trustScore: 94,
    credibilityScore: 94,
    content: {
      fusha: "يستعرض هذا التحقيق شبكات التضليل الرقمي التي استُخدمت خلال الحملات الانتخابية الأخيرة.",
      simple: "هذا التحقيق يشرح شبكات التضليل الرقمي في الانتخابات الأخيرة.",
      dialect: "التحقيق بيكشف شبكات التضليل الرقمي بالانتخابات الأخيرة.",
    },
    lead: {
      fusha: "كشف تحقيق استقصائي موسّع عن شبكة من الحسابات المزيفة والصفحات المنسّقة التي نشرت معلومات مضللة بهدف التأثير على الرأي العام خلال الحملات الانتخابية الأخيرة، مستنداً إلى تحليل بيانات مفتوحة ومصادر رسمية.",
      simple: "تحقيق كبير كشف شبكة حسابات مزيفة نشرت معلومات مضللة للتأثير على الناس في الانتخابات.",
      dialect: "تحقيق كبير كشف حسابات مزيفة نشرت أخبار مضللة بالانتخابات.",
    },
    bodyParagraphs: {
      fusha: [
        "استخدمت الشبكة تقنيات أتمتة لنشر آلاف المنشورات المتشابهة عبر منصات التواصل الاجتماعي، مع تنسيق زمني يتزامن مع أحداث الحملة الانتخابية. وقد ربط التحقيق بين 47 حساباً رئيسياً ومصادر تمويل غير معلنة.",
        "وأظهر التحليل الجغرافي للصور المرفقة أن بعض المحتوى المنتشر لم يُلتقط في المواقع التي زُعم أنها التقطت فيها، مما يقوّض مصداقية عشرات المنشورات التي انتشرت على نطاق واسع.",
      ],
      simple: [
        "الشبكة استخدمت برامج لنشر آلاف المنشورات المتشابهة على السوشال ميديا. التحقيق ربط 47 حساب بمصادر تمويل غير معروفة.",
        "تحليل الصور أظهر أن بعض المحتوى لم يُصوَّر في الأماكن المزعومة.",
      ],
      dialect: [
        "الشبكة استخدمت برامج تنشر آلاف البوستات المتشابهة. التحقيق ربط 47 حساب بفلوس مش معروفة.",
        "تحليل الصور بين إن بعض المحتوى ما انصور بالأماكن اللي قالوا عنها.",
      ],
    },
    quote: {
      fusha: "«البيانات لا تكذب، لكن من يعرضها قد يختار ما يُظهر وما يُخفي. مهمتنا كصحفيين أن نكشف هذا الاختيار.»",
      simple: "«الأرقام ما بتكذب، بس اللي بيعرضها ممكن يختار شو يبين وشو يخفي. شغلتنا نكشف هالاختيار.»",
      dialect: "«الأرقام ما بتكذب، بس اللي بيعرضها بيختار شو يبين. شغلتنا نكشف هالشي.»",
    },
    featuredImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
    featuredImageCaption:
      "خريطة تفاعلية توضح ترابط الحسابات الوهمية ومصدر انطلاق الهجمات الرقمية",
    credibilityBreakdown: {
      sourceAccuracy: 98,
      reportNeutrality: 85,
      dataVerification: 92,
    },
    quickVerification: [
      { id: 1, text: "تم التحقق من الصور جغرافياً", status: "verified" },
      { id: 2, text: "مطابقة بيانات السجلات الرسمية", status: "verified" },
      { id: 3, text: "اقتباس واحد من مصدر مجهول", status: "warning" },
    ],
    relatedArticles: [
      {
        id: 2,
        title: "أزمة المياه في المنطقة: الحقائق مقابل الشائعات",
        credibilityLevel: "high",
      },
    ],
    sources: [
      {
        id: 1,
        label: "تقرير منظمة الأمن الرقمي 2024",
        type: "document",
        sourceCategory: "تقرير رسمي",
        verificationStatus: "verified",
        reliability: 100,
      },
      {
        id: 2,
        label: "بيانات تحليل الشبكات الاجتماعية",
        type: "url",
        url: "https://example.com/data",
        sourceCategory: "بيانات تقنية",
        verificationStatus: "verified",
        reliability: 95,
      },
      {
        id: 3,
        label: "شهادة خبير في الأمن السيبراني",
        type: "person",
        sourceCategory: "شهادة",
        verificationStatus: "under_review",
        reliability: 60,
      },
      {
        id: 4,
        label: "مصدر مجهول",
        type: "anonymous",
        sourceCategory: "مصدر مجهول",
        verificationStatus: "under_review",
        reliability: 40,
      },
    ],
    timeline: [
      { id: 1, date: "2024-10-05", label: "بدء جمع البيانات" },
      { id: 2, date: "2024-10-10", label: "تحديث البيانات وتحليل الصور" },
      { id: 3, date: "2024-10-14", label: "نشر التقرير النهائي" },
    ],
    scoreHistory: [
      {
        id: 1,
        date: "14 أكتوبر",
        trustScore: 94,
        note: "تقرير نهائي",
        statusLabel: "تقرير نهائي",
        description: "بعد مراجعة تحريرية شاملة ودمج نتائج التحقق الجغرافي للصور.",
      },
      {
        id: 2,
        date: "10 أكتوبر",
        trustScore: 88,
        note: "تحديث البيانات",
        statusLabel: "تحديث البيانات",
        description: "دمج نتائج تحليل الصور والمطابقة مع السجلات الرسمية.",
      },
      {
        id: 3,
        date: "5 أكتوبر",
        trustScore: 72,
        note: "مسودة أولى",
        statusLabel: "مسودة أولى",
        description: "نسخة أولية قبل التحقق الكامل من المصادر والبيانات التقنية.",
      },
    ],
  },
  2: {
    id: 2,
    title: "أزمة المياه في المنطقة: الحقائق مقابل الشائعات",
    author: "ليلى خالد",
    publishedAt: "2026-05-25T14:30:00Z",
    readingTimeMinutes: 8,
    trustScore: 88,
    credibilityScore: 86,
    content: {
      fusha: "يتناول هذا التحليل أزمة المياه وفصل الحقائق الموثقة عن الشائعات المتداولة.",
      simple: "التحليل يوضح أزمة المياه ويفصل الحقائق عن الشائعات.",
      dialect: "التحليل بيفصل حقائق أزمة المياه عن الشائعات.",
    },
    sources: [
      {
        id: 1,
        label: "تقرير وزارة الموارد المائية",
        type: "document",
        sourceCategory: "تقرير رسمي",
        verificationStatus: "verified",
        reliability: 98,
      },
      {
        id: 2,
        label: "مراسل ميداني",
        type: "person",
        sourceCategory: "شهادة",
        verificationStatus: "verified",
        reliability: 85,
      },
    ],
    timeline: [
      { id: 1, date: "2026-05-22", label: "جمع المعلومات الأولية" },
      { id: 2, date: "2026-05-25", label: "التحقق والنشر" },
    ],
    scoreHistory: [
      {
        id: 1,
        date: "25 مايو",
        trustScore: 88,
        note: "منشور",
        description: "بعد التحقق من المصادر الرسمية والميدانية.",
      },
      {
        id: 2,
        date: "23 مايو",
        trustScore: 72,
        note: "مسودة",
        description: "نسخة أولية قبل التحقق الكامل.",
      },
    ],
  },
  3: {
    id: 3,
    title: "دراسة: الثقة مقابل المصداقية",
    author: "يوسف الحسن",
    publishedAt: "2026-05-22T09:15:00Z",
    trustScore: 88,
    credibilityScore: 90,
    content: {
      fusha: "توضح هذه الدراسة الفرق بين درجة الثقة ودرجة المصداقية في تقييم المقالات الإخبارية.",
      simple: "الدراسة تشرح الفرق بين درجة الثقة والمصداقية.",
      dialect: "الدراسة بتوضح الفرق بين الثقة والمصداقية.",
    },
    sources: [
      {
        id: 1,
        label: "منصة مصداق — وثائق تقنية",
        type: "document",
        sourceCategory: "وثيقة",
        verificationStatus: "verified",
        reliability: 95,
      },
    ],
    timeline: [
      { id: 1, date: "2026-05-18", label: "إعداد الدراسة" },
      { id: 2, date: "2026-05-22", label: "النشر" },
    ],
    scoreHistory: [
      {
        id: 1,
        date: "22 مايو",
        trustScore: 88,
        note: "منشور",
        description: "بعد المراجعة التحريرية النهائية.",
      },
    ],
  },
};

export function getMockArticle(id: number): Article | null {
  return MOCK_ARTICLES[id] ?? null;
}
