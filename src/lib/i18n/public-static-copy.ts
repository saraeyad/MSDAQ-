import { ROUTES } from "@/router/routes";
import type { Locale } from "@/lib/i18n/types";

export type TrustDimensionCopy = {
  key: string;
  label: string;
  question: string;
};

export type PublicStaticCopy = {
  common: {
    previous: string;
    next: string;
    readMore: string;
    listenNow: string;
    loading: string;
    later: string;
    submitRating: string;
    pageOf: (current: number, last: number) => string;
  };
  categories: {
    allCategories: string;
    subcategoriesFor: (name: string) => string;
    flyoutSubcategories: string;
    emptyFeedTitle: string;
    emptyFeedDescription: string;
    emptySectionTitle: string;
    emptySectionDescription: string;
    notFoundTitle: string;
    notFoundLead: string;
    emptyInSection: (name: string) => string;
  };
  article: {
    backToArticles: string;
    notFound: string;
    noTextContent: string;
    galleryHeading: string;
    sourcesHeading: string;
    playVideo: (title: string) => string;
    loadingMedia: string;
    prevStory: string;
    nextStory: string;
    relatedTitle: string;
    relatedEmpty: string;
    langFormal: string;
    langSimplified: string;
    langDialect: string;
    ratePrompt: string;
    rateButton: string;
    englishPendingBadge: string;
    englishPendingTitle: string;
    englishPendingLead: string;
    verifiedLabel: string;
    verifiedTitle: string;
    showEnglish: string;
    showArabic: string;
    translating: string;
    translateFailed: string;
    translateAriaToEnglish: string;
    translateAriaToArabic: string;
  };
  articleMedia: {
    noAudio: string;
    listenExternal: string;
    listenOnSoundCloud: string;
    watchExternal: string;
    loadFailed: string;
  };
  mediaTypes: {
    text: string;
    audio: string;
    video: string;
  };
  footerSocial: {
    website: string;
  };
  partnersStrip: {
    kicker: string;
    heading: string;
  };
  partnersPage: {
    title: string;
    description: string;
    footerNote: string;
  };
  partnersList: {
    id: string;
    title: string;
    logoAlt: string;
    initials: string;
  }[];
  feedback: {
    fabAria: string;
    fabLabel: string;
    thanks: string;
    platformKicker: string;
    platformTitle: string;
    platformLead: string;
    platformCommentLabel: string;
    platformCommentOptional: string;
    platformCommentPlaceholder: string;
    anonNote: string;
  };
  trustIndex: {
    stamp: string;
    kicker: string;
    title: string;
    lead: string;
    close: string;
    commentLabel: string;
    commentOptional: string;
    commentPlaceholder: string;
    articleUnavailable: string;
    reviewLimit: string;
    articleRatePrompt: string;
    articleRateButton: string;
    dimensions: TrustDimensionCopy[];
    platformDimensions: TrustDimensionCopy[];
  };
  staticSections: {
    path: string;
    title: string;
    description: string;
    badge: string;
  }[];
  sectionPages: {
    comingTitle: string;
    comingLead: string;
  };
  toolsCategories: {
    editor: { label: string; description: string };
    voice: { label: string; description: string };
    editorial: { label: string; description: string };
    image: { label: string; description: string };
  };
  publicToolLabels: Record<string, { label: string; description: string }>;
};

const arTrustDimensions: TrustDimensionCopy[] = [
  {
    key: "accuracy",
    label: "الدقة",
    question: "المعلومات في هذا المقال كانت دقيقة",
  },
  {
    key: "credibility",
    label: "المصداقية",
    question: "أثق في المصدر الذي استند إليه هذا المحتوى",
  },
  {
    key: "objectivity",
    label: "الموضوعية",
    question: "شعرت أن المقال عرض الموضوع بحياد دون تحيز",
  },
  {
    key: "transparency",
    label: "الشفافية",
    question: "كان واضحاً من أين جاءت المعلومات (مصادر، بيانات، شهادات)",
  },
];

const arPlatformDimensions: TrustDimensionCopy[] = [
  {
    key: "accuracy",
    label: "الدقة",
    question: "بشكل عام، المعلومات التي تنشرها هذه المنصة دقيقة وموثوقة",
  },
  {
    key: "credibility",
    label: "المصداقية",
    question: "أثق في هذه المنصة كمصدر إعلامي موثوق",
  },
  {
    key: "objectivity",
    label: "الموضوعية",
    question: "تعرض المنصة القضايا المختلفة بحياد وتوازن دون تحيز",
  },
  {
    key: "transparency",
    label: "الشفافية",
    question: "تُبيّن المنصة بوضوح مصادر معلوماتها وطريقة عملها",
  },
  {
    key: "consistency",
    label: "الاتساق",
    question:
      "جودة المحتوى على المنصة ثابتة ولا تتفاوت بشكل كبير بمرور الوقت",
  },
];

export const PUBLIC_STATIC_COPY: Record<Locale, PublicStaticCopy> = {
  ar: {
    common: {
      previous: "السابق",
      next: "التالي",
      readMore: "اقرأ المزيد",
      listenNow: "استمع الآن",
      loading: "جاري التحميل...",
      later: "لاحقاً",
      submitRating: "إرسال التقييم",
      pageOf: (current, last) => `صفحة ${current} من ${last}`,
    },
    categories: {
      allCategories: "كل التصنيفات",
      subcategoriesFor: (name) => `${name} — تصنيفات فرعية`,
      flyoutSubcategories: "تصنيفات فرعية",
      emptyFeedTitle: "لا يوجد محتوى منشور حالياً",
      emptyFeedDescription: "تابعنا للاطلاع على المحتوى القادم.",
      emptySectionTitle: "لا يوجد محتوى في هذا القسم",
      emptySectionDescription:
        "تابعنا للاطلاع على المحتوى القادم في هذا القسم.",
      notFoundTitle: "القسم غير موجود",
      notFoundLead:
        "لم نعثر على هذا القسم. تحقق من الرابط أو عد إلى الصفحة الرئيسية.",
      emptyInSection: (name) => `لا يوجد محتوى في «${name}»`,
    },
    article: {
      backToArticles: "العودة للمقالات",
      notFound: "المقال غير موجود.",
      noTextContent: "لا يوجد محتوى نصي لهذا المقال.",
      galleryHeading: "معرض الصور",
      sourcesHeading: "المصادر",
      playVideo: (title) => `تشغيل فيديو: ${title}`,
      loadingMedia: "جاري التحميل",
      prevStory: "الخبر السابق",
      nextStory: "الخبر التالي",
      relatedTitle: "مقالات ذات صلة",
      relatedEmpty: "لا توجد مقالات مشابهة.",
      langFormal: "فصحى",
      langSimplified: "مبسّط",
      langDialect: "عامية",
      ratePrompt:
        "ما مدى ثقتك بهذا المحتوى؟ شاركنا تقييمك — مجهول ويستغرق دقيقة.",
      rateButton: "قيّم هذا المقال",
      englishPendingBadge: "النسخة الإنجليزية قريباً",
      englishPendingTitle: "النسخة الإنجليزية قيد الإعداد",
      englishPendingLead:
        "هذا المقال متاح بالعربية. نعمل على نشر ترجمة إنجليزية — عد لاحقاً.",
      verifiedLabel: "موثّق",
      verifiedTitle: "مقال منشور واجتاز التحقق التحريري",
      showEnglish: "English",
      showArabic: "العربية",
      translating: "جاري الترجمة…",
      translateFailed: "تعذّر تحميل الترجمة.",
      translateAriaToEnglish: "عرض هذا المقال بالإنجليزية دون تغيير لغة الموقع",
      translateAriaToArabic: "عرض هذا المقال بالعربية دون تغيير لغة الموقع",
    },
    articleMedia: {
      noAudio: "لا يتوفر مصدر صوتي",
      listenExternal: "استمع على المنصة الخارجية",
      listenOnSoundCloud: "استمع على ساوند كلاود",
      watchExternal: "مشاهدة على المنصة الخارجية",
      loadFailed: "تعذّر تحميل المصدر",
    },
    mediaTypes: {
      text: "نص",
      audio: "صوت",
      video: "فيديو",
    },
    footerSocial: {
      website: "الموقع",
    },
    partnersStrip: {
      kicker: "شركاؤنا",
      heading: "نعمل مع مؤسسات دولية ومحلية",
    },
    partnersPage: {
      title: "شركاؤنا",
      description:
        "شراكات استراتيجية مع مؤسسات دولية ومحلية تدعم عملنا في التحقق الإعلامي وتمكين المجتمع.",
      footerNote:
        "للاستفسار عن الشراكات أو التعاون المؤسسي، تواصل معنا عبر صفحة المركز.",
    },
    partnersList: [
      {
        id: "cfi",
        title: "سي إف آي للتنمية الإعلامية",
        logoAlt: "CFI Media Development",
        initials: "CFI",
      },
      {
        id: "un-trust",
        title: "صندوق الأمم المتحدة لإنهاء العنف ضد المرأة",
        logoAlt: "United Nations Trust Fund to End Violence Against Women",
        initials: "UN",
      },
      {
        id: "crs",
        title: "منظمة الإغاثة الكاثوليكية",
        logoAlt: "Catholic Relief Services",
        initials: "CRS",
      },
      {
        id: "aisha",
        title: "جمعية عايشة لحماية المرأة والطفل",
        logoAlt: "Aisha Association for Woman and Child Protection",
        initials: "عايشة",
      },
      {
        id: "birzeit",
        title: "جامعة بيرزيت",
        logoAlt: "Birzeit University",
        initials: "BZU",
      },
      {
        id: "wacc",
        title: "الجمعية العالمية للاتصالات المسيحية",
        logoAlt: "WACC — communication for all",
        initials: "WACC",
      },
      {
        id: "ndc",
        title: "مركز تطوير المؤسسات الأهلية الفلسطينية",
        logoAlt: "NGO Development Center",
        initials: "NDC",
      },
    ],
    feedback: {
      fabAria: "شاركنا رأيك في منصة صبارة بوست",
      fabLabel: "شاركنا رأيك",
      thanks: "شكراً — تم تسجيل تقييمك",
      platformKicker: "مؤشر ثقة الجمهور بالمنصة",
      platformTitle: "ما مدى ثقتك في صبارة بوست؟",
      platformLead: "استطلاع مجهول · خمسة أسئلة فقط",
      platformCommentLabel: "ما أكثر شيء أثر على تقييمك لتجربة المنصة؟",
      platformCommentOptional: " اختياري",
      platformCommentPlaceholder: "مثلاً: سهولة التصفح، أو تنوع المحتوى...",
      anonNote: "هويتك غير مسجّلة · صوتك يُحتسب",
    },
    trustIndex: {
      stamp: "رأيك",
      kicker: "مؤشر ثقة الجمهور",
      title: "ما مدى ثقتك بهذا المحتوى؟",
      lead: "وصلت للنهاية — أربعة أسئلة سريعة، هويتك غير مسجّلة",
      close: "إغلاق التقييم",
      commentLabel: "في جملة واحدة، ما أكثر شيء أثر على تقييمك؟",
      commentOptional: " اختياري",
      commentPlaceholder: "مثلاً: وضوح المصادر، أو نبرة الخبر...",
      articleUnavailable: "هذا المقال لم يعد متاحاً",
      reviewLimit: "اكتمل عدد التقييمات لهذا المقال",
      articleRatePrompt:
        "ما مدى ثقتك بهذا المحتوى؟ شاركنا تقييمك — مجهول ويستغرق دقيقة.",
      articleRateButton: "قيّم هذا المقال",
      dimensions: arTrustDimensions,
      platformDimensions: arPlatformDimensions,
    },
    staticSections: [
      {
        path: ROUTES.RUYA,
        title: "رؤيا",
        description:
          "تحليلات وتقديرات موقف — رؤى تحريرية حول الأحداث والاتجاهات الإعلامية.",
        badge: "رؤيا",
      },
      {
        path: ROUTES.PUBLICATIONS,
        title: "إصدارات ودراسات",
        description:
          "تقارير ودراسات منشورة — أبحاث صبارة بوست حول المعلومات المضللة والإعلام.",
        badge: "دراسات",
      },
      {
        path: ROUTES.PUBLICATIONS_REPORTS,
        title: "تقارير",
        description:
          "تقارير تحريرية وبحثية — رصد وتحليل للأحداث والظواهر الإعلامية.",
        badge: "تقارير",
      },
      {
        path: ROUTES.PUBLICATIONS_BOOKS,
        title: "كتب",
        description:
          "إصدارات وكتب منشورة — مطبوعات صبارة بوست وشركائنا في مجال التحقق والإعلام.",
        badge: "كتب",
      },
      {
        path: ROUTES.DATA_INFO,
        title: "معلومات وبيانات",
        description:
          "بيانات ومعلومات موثقة — أرقام، إحصاءات، وملفات معلوماتية للصحفيين والباحثين.",
        badge: "بيانات",
      },
    ],
    sectionPages: {
      comingTitle: "قريباً — محتوى جديد",
      comingLead: "نعمل على إعداد محتوى لهذا القسم.",
    },
    toolsCategories: {
      editor: {
        label: "أدوات التحرير",
        description: "صقل النص وتحسين الصياغة قبل النشر",
      },
      voice: {
        label: "أدوات الصوت",
        description: "تفريغ الصوت، توليده، وإدارته في المكتبة",
      },
      editorial: {
        label: "أدوات تحريرية",
        description: "فحوصات تحريرية وتوطين المحتوى",
      },
      image: {
        label: "أدوات الصور والتحقق",
        description: "التحقق من الصور والمصادر الرقمية",
      },
    },
    publicToolLabels: {
      "text-to-speech": {
        label: "تحويل النص إلى صوت",
        description: "توليد ملف صوتي من نص مكتوب",
      },
      "speech-to-text": {
        label: "تحويل الصوت إلى نص",
        description: "تفريغ تسجيل صوتي إلى نص قابل للتحرير",
      },
      "generated-audios": {
        label: "مكتبة الملفات الصوتية",
        description: "تصفّح الملفات الصوتية المحفوظة في المكتبة",
      },
      transcripts: {
        label: "مكتبة النصوص المفرغة",
        description: "تصفّح النصوص المفرغة المحفوظة في المكتبة",
      },
      "standards-check": {
        label: "فحص المعايير",
        description: "التزام النص بمعايير الفصحى التحريرية",
      },
      "credibility-check": {
        label: "فحص المصداقية",
        description: "هذه الخدمة غير متاحة حاليا",
      },
      localization: {
        label: "التبسيط واللهجة",
        description: "تبسيط النص أو توطينه بلهجة محلية",
      },
      "reverse-image": {
        label: "بحث عكسي عن الصور",
        description: "تتبّع مصدر الصورة وتاريخ ظهورها",
      },
      "ai-detection": {
        label: "كشف الصور بالذكاء الاصطناعي",
        description:
          "كشف ما إذا كانت الصورة مُولَّدة أو مُعدَّلة بالذكاء الاصطناعي",
      },
      "domain-checker": {
        label: "فحص النطاق",
        description: "مراجعة سمعة ومصداقية المواقع قبل الاعتماد عليها",
      },
    },
  },
  en: {
    common: {
      previous: "Previous",
      next: "Next",
      readMore: "Read more",
      listenNow: "Listen now",
      loading: "Loading…",
      later: "Later",
      submitRating: "Submit rating",
      pageOf: (current, last) => `Page ${current} of ${last}`,
    },
    categories: {
      allCategories: "All categories",
      subcategoriesFor: (name) => `${name} — subcategories`,
      flyoutSubcategories: "Subcategories",
      emptyFeedTitle: "No published content yet",
      emptyFeedDescription: "Check back soon for new stories.",
      emptySectionTitle: "No content in this section",
      emptySectionDescription: "Check back soon for new stories in this section.",
      notFoundTitle: "Section not found",
      notFoundLead:
        "We could not find this section. Check the link or return to the home page.",
      emptyInSection: (name) => `No content in “${name}”`,
    },
    article: {
      backToArticles: "Back to articles",
      notFound: "Article not found.",
      noTextContent: "This article has no text content.",
      galleryHeading: "Photo gallery",
      sourcesHeading: "Sources",
      playVideo: (title) => `Play video: ${title}`,
      loadingMedia: "Loading",
      prevStory: "Previous story",
      nextStory: "Next story",
      relatedTitle: "Related articles",
      relatedEmpty: "No related articles yet.",
      langFormal: "Modern Standard Arabic",
      langSimplified: "Simplified",
      langDialect: "Dialect",
      ratePrompt:
        "How much do you trust this content? Share a quick anonymous rating.",
      rateButton: "Rate this article",
      englishPendingBadge: "English version coming soon",
      englishPendingTitle: "English version coming soon",
      englishPendingLead:
        "This story is available in Arabic. We are preparing an English translation — please check back soon.",
      verifiedLabel: "Verified",
      verifiedTitle: "Published and passed editorial verification",
      showEnglish: "English",
      showArabic: "العربية",
      translating: "Translating…",
      translateFailed: "Could not load the translation.",
      translateAriaToEnglish: "Show this article in English without changing site language",
      translateAriaToArabic: "Show this article in Arabic without changing site language",
    },
    articleMedia: {
      noAudio: "No audio source available",
      listenExternal: "Listen on external platform",
      listenOnSoundCloud: "Listen on SoundCloud",
      watchExternal: "Watch on external platform",
      loadFailed: "Could not load media",
    },
    mediaTypes: {
      text: "Text",
      audio: "Audio",
      video: "Video",
    },
    footerSocial: {
      website: "Website",
    },
    partnersStrip: {
      kicker: "Our partners",
      heading: "Working with international and local institutions",
    },
    partnersPage: {
      title: "Partners",
      description:
        "Strategic partnerships with international and local organizations supporting our verification work and community empowerment.",
      footerNote:
        "For partnership or institutional collaboration inquiries, contact us through the center page.",
    },
    partnersList: [
      {
        id: "cfi",
        title: "CFI Media Development",
        logoAlt: "CFI Media Development",
        initials: "CFI",
      },
      {
        id: "un-trust",
        title: "UN Trust Fund to End Violence against Women",
        logoAlt: "United Nations Trust Fund to End Violence Against Women",
        initials: "UN",
      },
      {
        id: "crs",
        title: "Catholic Relief Services",
        logoAlt: "Catholic Relief Services",
        initials: "CRS",
      },
      {
        id: "aisha",
        title: "Aisha Association for Woman and Child Protection",
        logoAlt: "Aisha Association for Woman and Child Protection",
        initials: "Aisha",
      },
      {
        id: "birzeit",
        title: "Birzeit University",
        logoAlt: "Birzeit University",
        initials: "BZU",
      },
      {
        id: "wacc",
        title: "World Association for Christian Communication",
        logoAlt: "WACC — communication for all",
        initials: "WACC",
      },
      {
        id: "ndc",
        title: "NGO Development Center",
        logoAlt: "NGO Development Center",
        initials: "NDC",
      },
    ],
    feedback: {
      fabAria: "Share your feedback on SABBARA POST",
      fabLabel: "Share feedback",
      thanks: "Thank you — your rating was recorded",
      platformKicker: "Public trust in the platform",
      platformTitle: "How much do you trust SABBARA POST?",
      platformLead: "Anonymous survey · five quick questions",
      platformCommentLabel: "What influenced your rating of the platform most?",
      platformCommentOptional: " (optional)",
      platformCommentPlaceholder:
        "For example: ease of browsing, or variety of content…",
      anonNote: "Your identity is not recorded · your voice counts",
    },
    trustIndex: {
      stamp: "Your view",
      kicker: "Public trust index",
      title: "How much do you trust this content?",
      lead: "You reached the end — four quick questions, anonymously",
      close: "Close rating",
      commentLabel: "In one sentence, what influenced your rating most?",
      commentOptional: " (optional)",
      commentPlaceholder: "For example: source clarity, or tone of the story…",
      articleUnavailable: "This article is no longer available",
      reviewLimit: "This article has reached its review limit",
      articleRatePrompt:
        "How much do you trust this content? Share a quick anonymous rating.",
      articleRateButton: "Rate this article",
      dimensions: [
        {
          key: "accuracy",
          label: "Accuracy",
          question: "The information in this article was accurate",
        },
        {
          key: "credibility",
          label: "Credibility",
          question: "I trust the source this content relied on",
        },
        {
          key: "objectivity",
          label: "Objectivity",
          question: "The article felt balanced and unbiased",
        },
        {
          key: "transparency",
          label: "Transparency",
          question: "It was clear where the information came from",
        },
      ],
      platformDimensions: [
        {
          key: "accuracy",
          label: "Accuracy",
          question:
            "Overall, the information this platform publishes is accurate and reliable",
        },
        {
          key: "credibility",
          label: "Credibility",
          question: "I trust this platform as a reliable news source",
        },
        {
          key: "objectivity",
          label: "Objectivity",
          question:
            "The platform covers different issues with balance and without bias",
        },
        {
          key: "transparency",
          label: "Transparency",
          question:
            "The platform clearly shows its sources and how it works",
        },
        {
          key: "consistency",
          label: "Consistency",
          question:
            "Content quality on the platform stays steady over time",
        },
      ],
    },
    staticSections: [
      {
        path: ROUTES.RUYA,
        title: "Vision",
        description:
          "Analysis and editorial perspective on events and media trends.",
        badge: "Vision",
      },
      {
        path: ROUTES.PUBLICATIONS,
        title: "Publications & studies",
        description:
          "Published reports and research on misinformation and media.",
        badge: "Studies",
      },
      {
        path: ROUTES.PUBLICATIONS_REPORTS,
        title: "Reports",
        description: "Editorial and research reports on media phenomena.",
        badge: "Reports",
      },
      {
        path: ROUTES.PUBLICATIONS_BOOKS,
        title: "Books",
        description:
          "Books and publications from SABBARA POST and verification partners.",
        badge: "Books",
      },
      {
        path: ROUTES.DATA_INFO,
        title: "Data & information",
        description:
          "Verified data and information files for journalists and researchers.",
        badge: "Data",
      },
    ],
    sectionPages: {
      comingTitle: "Coming soon — new content",
      comingLead: "We are preparing content for this section.",
    },
    toolsCategories: {
      editor: {
        label: "Editing tools",
        description: "Sharpen wording before a story goes out",
      },
      voice: {
        label: "Voice tools",
        description: "Transcribe, generate, and manage audio in the library",
      },
      editorial: {
        label: "Editorial checks",
        description: "Standards, credibility, and local voice",
      },
      image: {
        label: "Images & verification",
        description: "Check pictures and the sites they come from",
      },
    },
    publicToolLabels: {
      "text-to-speech": {
        label: "Text to speech",
        description: "Generate an audio file from written text",
      },
      "speech-to-text": {
        label: "Speech to text",
        description: "Transcribe a recording into editable text",
      },
      "generated-audios": {
        label: "Audio library",
        description: "Browse saved audio files in the library",
      },
      transcripts: {
        label: "Transcript library",
        description: "Browse saved transcripts in the library",
      },
      "standards-check": {
        label: "Standards check",
        description: "Check text against editorial Arabic standards",
      },
      "credibility-check": {
        label: "Credibility check",
        description: "This service is not available yet",
      },
      localization: {
        label: "Simplify & localize",
        description: "Simplify text or adapt it to a local dialect",
      },
      "reverse-image": {
        label: "Reverse image search",
        description: "Trace where an image came from and when it appeared",
      },
      "ai-detection": {
        label: "AI image detection",
        description: "Detect AI-generated or AI-edited images",
      },
      "domain-checker": {
        label: "Domain check",
        description: "Review a site's reputation before relying on it",
      },
    },
  },
};

export function getPublicStaticCopy(locale: Locale): PublicStaticCopy {
  return PUBLIC_STATIC_COPY[locale];
}
