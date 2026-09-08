import type { Locale } from "@/lib/i18n/types";

export type PublicCopy = {
  brand: {
    name: string;
    homeAria: string;
  };
  nav: {
    home: string;
    sections: string;
    vision: string;
    publications: string;
    allPublications: string;
    reports: string;
    books: string;
    aboutCenter: string;
    aboutUs: string;
    partners: string;
    dataInfo: string;
    login: string;
    workspace: string;
    menu: string;
    openMenu: string;
    subcategories: string;
    searchPlaceholder: string;
  };
  hero: {
    kicker: [string, string, string];
    headline: string;
    headlineAccent: string;
    brandLine: string;
    lead: string;
    ctaExplore: string;
    ctaPlay: string;
    scriptLine: string;
    spine: string[];
    rec: string;
    photoAlt: string;
  };
  home: {
    latestBadge: string;
    latestTitle: string;
    latestTitleLine: string;
    latestTitleAccent: string;
    latestKicker: [string, string, string];
    latestLead: string;
    nowLabel: string;
    allFilter: string;
    noArticles: string;
    noFilterMatch: string;
    filterEmpty: (label: string) => string;
    toolsKicker: [string, string, string];
    toolsTitleLine: string;
    toolsTitleAccent: string;
    toolsLead: string;
    toolsTitle: string;
    toolsCtaTitle: string;
    toolsCtaLead: string;
    toolsCta: string;
    toolsCollapse: string;
    toolsVoiceTitle: string;
    toolsVoiceLead: string;
  };
  footer: {
    tagline: string;
    sections: string;
    info: string;
    location: string;
    mapHeading: string;
    mapTitle: string;
    shareFeedback: string;
    copyright: (year: number) => string;
    aboutUs: string;
    partners: string;
    sitePolicy: string;
    terms: string;
    verificationTools: string;
    home: string;
    vision: string;
    publicationsStudies: string;
    dataInfo: string;
  };
  welcome: {
    close: string;
    kicker: string;
    titleLine: string;
    titleAfter: string;
    lead: string;
    cta: string;
  };
  locale: {
    switchTo: string;
    current: string;
    comingSoon: string;
  };
  pageHero: {
    articles: string;
    articlesLead: string;
    searchResults: (query: string) => string;
    searching: string;
    resultCount: (count: number) => string;
    noSearchResults: string;
    noArticles: string;
    noResultsFor: (query: string) => string;
  };
  toolsPage: {
    kicker: string;
    title: string;
    lead: string;
    count: (n: number) => string;
    openTool: string;
    allFilter: string;
  };
  about: {
    title: string;
    kicker: string;
    lead: string;
    collageAlt: string;
    visionTitle: string;
    visionBody: string;
    visionQuote: string;
    missionTitle: string;
    missionBody: string;
    missionQuote: string;
    philosophyTitle: string;
    philosophyBody: string;
    valuesTitle: string;
    valuesLead: string;
    values: { title: string; body: string }[];
  };
};

const ar: PublicCopy = {
  brand: {
    name: "صبارة بوست",
    homeAria: "صبارة بوست — العودة للرئيسية",
  },
  nav: {
    home: "الرئيسية",
    sections: "الأقسام",
    vision: "رؤيا",
    publications: "إصدارات",
    allPublications: "جميع الإصدارات",
    reports: "تقارير",
    books: "كتب",
    aboutCenter: "عن المركز",
    aboutUs: "من نحن",
    partners: "شركاؤنا",
    dataInfo: "معلومات وبيانات",
    login: "تسجيل الدخول",
    workspace: "مساحة العمل",
    menu: "القائمة",
    openMenu: "فتح القائمة",
    subcategories: "تصنيفات فرعية",
    searchPlaceholder: "ابحث في المقالات…",
  },
  hero: {
    kicker: ["غزة", "ناس", "صمود"],
    headline: "قصص حقيقية",
    headlineAccent: "حقائق أوضح",
    brandLine: "صبّارة بوست",
    lead: "إعلام فلسطيني- نروي القصص اليومية",
    ctaExplore: "استكشف قصصنا",
    ctaPlay: "شاهد آخر فيديو",
    scriptLine: "نفس الناس · قصص أقوى",
    spine: ["ناس", "أماكن", "رؤى", "فلسطين", "دائماً"],
    rec: "REC",
    photoAlt: "طفل يرتدي كوفية وينظر إلى أفق غزة — صورة من صبارة بوست",
  },
  home: {
    latestBadge: "أحدث المحتوى",
    latestTitle: "استكشف الأخبار والتحققات",
    latestTitleLine: "استكشف الأخبار",
    latestTitleAccent: "تحقق أوضح",
    latestKicker: ["قصص", "تحقق", "غزة"],
    latestLead: "تصفّح أحدث عشرة مقالات من المنصة",
    nowLabel: "الآن",
    allFilter: "الكل",
    noArticles: "لا توجد مقالات منشورة حالياً.",
    noFilterMatch: "لا توجد مقالات مطابقة لهذا الفلتر.",
    filterEmpty: (label) => `لا توجد مقالات في «${label}».`,
    toolsKicker: ["تحقق", "صور", "صوت"],
    toolsTitleLine: "أدواتنا.",
    toolsTitleAccent: "للتحقق من الأخبار.",
    toolsTitle: "أدواتنا للتحقق من الأخبار",
    toolsLead:
      "نفس الأدوات التي يستخدمها فريق التحرير قبل النشر — من فحص الادعاءات إلى تتبع الصور والصوت.",
    toolsCtaTitle: "المزيد من الأدوات",
    toolsCtaLead: "افتح بقية أدوات التحقق المستخدمة داخل المنصة",
    toolsCta: "استكشف الأدوات",
    toolsCollapse: "إخفاء الأدوات الإضافية",
    toolsVoiceTitle: "أدوات الصوت",
    toolsVoiceLead: "تحويل الصوت إلى نص والنص إلى صوت للمحتوى الصوتي.",
  },
  footer: {
    tagline:
      "صبارة بوست — منصة إعلامية موثوقة تمكّن المجتمع من مواجهة المعلومات المضللة.",
    sections: "الأقسام",
    info: "معلومات",
    location: "غزة، فلسطين",
    mapHeading: "موقعنا",
    mapTitle: "موقع صبارة بوست على الخريطة",
    shareFeedback: "شاركنا رأيك",
    copyright: (year) => `© ${year} صبارة بوست — جميع الحقوق محفوظة`,
    aboutUs: "من نحن",
    partners: "شركاؤنا",
    sitePolicy: "سياسة الموقع",
    terms: "الشروط والأحكام",
    verificationTools: "أدوات التحقق",
    home: "الرئيسية",
    vision: "رؤيا",
    publicationsStudies: "إصدارات ودراسات",
    dataInfo: "معلومات وبيانات",
  },
  welcome: {
    close: "إغلاق الإعلان",
    kicker: "افتتاحية المنصة",
    titleLine: "هذا الإطلاق التجريبي",
    titleAfter: "لمنصة صبارة بوست",
    lead: "نفتح الأبواب مبكراً لنسمع منكم — المحتوى والأدوات ما زالت تنمو مع كل زيارة.",
    cta: "ابدأ التصفح",
  },
  locale: {
    switchTo: "English",
    current: "العربية",
    comingSoon: "الترجمة قيد الإعداد",
  },
  pageHero: {
    articles: "المقالات",
    articlesLead: "تصفّح المقالات المنشورة على المنصة",
    searchResults: (query) => `نتائج البحث عن «${query}»`,
    searching: "جاري البحث في المقالات المنشورة...",
    resultCount: (count) => `${count} نتيجة`,
    noSearchResults: "لم يُعثر على مقالات مطابقة",
    noArticles: "لا توجد مقالات مطابقة.",
    noResultsFor: (query) => `لا توجد نتائج لـ «${query}».`,
  },
  toolsPage: {
    kicker: "SABBARA LAB",
    title: "مجموعة أدوات التحقق",
    lead: "كل ما يستخدمه فريق التحرير قبل أن يصل الخبر إليك — صور، صوت، لغة، ومصادر.",
    count: (n) => `${n} أداة`,
    openTool: "فتح الأداة",
    allFilter: "الكل",
  },
  about: {
    title: "من نحن",
    kicker: "مركز التنمية والإعلام المجتمعي",
    lead: "مجتمع عادل وديمقراطي يسهم فيه الإعلام في تعزيز حقوق الإنسان والمواطنة والحرية والعدالة الاجتماعية.",
    collageAlt: "تعريف المركز — أنشطة وفعاليات مركز التنمية والإعلام المجتمعي",
    visionTitle: "رؤية المركز",
    visionBody:
      "تعكس رؤية المركز تطلعه طويل الأمد نحو الإسهام في بناء مجتمع تسهم فيه وسائل الإعلام في تعزيز القيم الديمقراطية وحقوق الإنسان والمواطنة والعدالة الاجتماعية. وفي السياق الفلسطيني، ولا سيما في قطاع غزة، تؤكد هذه الرؤية على دور الإعلام في إيصال الأصوات وتعزيز المشاركة المدنية والإسهام في إحداث تغيير اجتماعي إيجابي.",
    visionQuote:
      "مجتمع عادل وديمقراطي يسهم فيه الإعلام في تعزيز حقوق الإنسان والمواطنة والحرية والعدالة الاجتماعية.",
    missionTitle: "رسالة المركز",
    missionBody:
      "تعكس رسالة المركز دوره كمؤسسة من مؤسسات المجتمع المدني تعمل عند تقاطع مجالات الإعلام وحقوق الإنسان والتنمية المجتمعية. وتركز الرسالة على تمكين الصحفيين والشباب والنساء والفئات المهمشة الأخرى من خلال الإعلام والمشاركة المدنية والتنمية القائمة على الحقوق، بما يسهم في تعزيز المشاركة والمساءلة والعدالة الاجتماعية.",
    missionQuote:
      "مركز التنمية والإعلام المجتمعي مؤسسة مجتمع مدني مستقلة وغير ربحية، تعمل على تمكين الصحفيين والنساء والشباب والفئات المهمشة الأخرى من خلال الإعلام والمشاركة المدنية والتنمية القائمة على الحقوق، بما يسهم في تعزيز حقوق الإنسان والمساءلة والعدالة الاجتماعية.",
    philosophyTitle: "فلسفة المركز",
    philosophyBody:
      "تستند فلسفة المركز إلى الإيمان بأن التغيير الاجتماعي المستدام يتحقق من خلال تمكين الأفراد والمجتمعات من المطالبة بحقوقهم، وإيصال أصواتهم، والمشاركة الفاعلة في الحياة العامة. وينظر المركز إلى الإعلام ليس باعتباره مجرد أداة للتواصل، بل كمنصة فاعلة لإحداث التغيير وتعزيز المشاركة المدنية والمساءلة والعدالة الاجتماعية والتنمية الشاملة، ولا سيما للفئات المهمشة والأقل تمثيلًا.",
    valuesTitle: "القيم الاستراتيجية",
    valuesLead: "يسترشد عمل المركز بالقيم الجوهرية التالية:",
    values: [
      {
        title: "حقوق الإنسان",
        body: "يلتزم المركز بتعزيز حقوق الإنسان وحمايتها، وضمان استناد جميع تدخلاته إلى مبادئ الكرامة والمساواة والعدالة والحرية.",
      },
      {
        title: "المشاركة",
        body: "يعزز المركز المشاركة الفاعلة والشاملة، بما يمكّن المجتمعات والفئات المستهدفة من التأثير في القرارات والمساهمة في إيجاد حلول مستدامة.",
      },
      {
        title: "العدالة الاجتماعية",
        body: "يسعى المركز إلى تعزيز الإنصاف والمساواة والتنمية الشاملة من خلال معالجة مظاهر الإقصاء والعوائق التي تواجه الفئات المهمشة والأكثر ضعفاً.",
      },
      {
        title: "المساءلة",
        body: "يلتزم المركز بمبادئ الشفافية والمسؤولية والمساءلة في حوكمته وشراكاته وتنفيذ برامجه.",
      },
      {
        title: "الإنصاف والشمول",
        body: "يعزز المركز الوصول المنصف إلى الفرص والتمثيل والخدمات من خلال تبني نهج شامل يقدّر التنوع ويعمل على إزالة العوائق التي تحد من المشاركة.",
      },
    ],
  },
};

const en: PublicCopy = {
  brand: {
    name: "SABBARA POST",
    homeAria: "SABBARA POST — back to home",
  },
  nav: {
    home: "Home",
    sections: "Sections",
    vision: "Vision",
    publications: "Publications",
    allPublications: "All publications",
    reports: "Reports",
    books: "Books",
    aboutCenter: "About",
    aboutUs: "About us",
    partners: "Partners",
    dataInfo: "Data & info",
    login: "Sign in",
    workspace: "Workspace",
    menu: "Menu",
    openMenu: "Open menu",
    subcategories: "Subcategories",
    searchPlaceholder: "Search articles…",
  },
  hero: {
    kicker: ["GAZA", "PEOPLE", "RESILIENCE"],
    headline: "Real Stories.",
    headlineAccent: "Brighter Truths.",
    brandLine: "SABBARA POST",
    lead: "Palestinian media, telling the everyday stories that matter.",
    ctaExplore: "Explore Our Stories",
    ctaPlay: "Watch Our Latest Video",
    scriptLine: "Same People Stronger Stories",
    spine: ["PEOPLE", "PLACES", "PERSPECTIVES", "PALESTINE", "ALWAYS"],
    rec: "REC",
    photoAlt: "A child in a keffiyeh looking over Gaza — SABBARA POST",
  },
  home: {
    latestBadge: "Latest",
    latestTitle: "Explore news & verification",
    latestTitleLine: "Explore the news.",
    latestTitleAccent: "Clearer verification.",
    latestKicker: ["Stories", "Verify", "Gaza"],
    latestLead: "Browse the ten most recent articles on the platform",
    nowLabel: "Now",
    allFilter: "All",
    noArticles: "No published articles yet.",
    noFilterMatch: "No articles match this filter.",
    filterEmpty: (label) => `No articles in “${label}”.`,
    toolsKicker: ["Verify", "Images", "Audio"],
    toolsTitleLine: "Our tools.",
    toolsTitleAccent: "For checking the news.",
    toolsTitle: "Our news verification tools",
    toolsLead:
      "The same suite our newsroom uses before publishing — claims, images, domains, and voice.",
    toolsCtaTitle: "More tools",
    toolsCtaLead:
      "Open the rest of the verification kit used inside the platform",
    toolsCta: "Explore the tools",
    toolsCollapse: "Hide extra tools",
    toolsVoiceTitle: "Voice tools",
    toolsVoiceLead: "Speech-to-text and text-to-speech for audio stories.",
  },
  footer: {
    tagline:
      "SABBARA POST — a trusted media platform empowering communities to counter misinformation.",
    sections: "Sections",
    info: "Information",
    location: "Gaza, Palestine",
    mapHeading: "Our location",
    mapTitle: "SABBARA POST on the map",
    shareFeedback: "Share your feedback",
    copyright: (year) => `© ${year} SABBARA POST — All rights reserved`,
    aboutUs: "About us",
    partners: "Partners",
    sitePolicy: "Site policy",
    terms: "Terms & conditions",
    verificationTools: "Verification tools",
    home: "Home",
    vision: "Vision",
    publicationsStudies: "Publications & studies",
    dataInfo: "Data & info",
  },
  welcome: {
    close: "Close announcement",
    kicker: "Platform launch",
    titleLine: "This is the pilot launch",
    titleAfter: "of SABBARA POST",
    lead: "We're opening early to hear from you — content and tools are still growing with every visit.",
    cta: "Start browsing",
  },
  locale: {
    switchTo: "العربية",
    current: "English",
    comingSoon: "Translation coming soon",
  },
  pageHero: {
    articles: "Articles",
    articlesLead: "Browse published articles on the platform",
    searchResults: (query) => `Search results for “${query}”`,
    searching: "Searching published articles…",
    resultCount: (count) => `${count} result${count === 1 ? "" : "s"}`,
    noSearchResults: "No matching articles found",
    noArticles: "No matching articles.",
    noResultsFor: (query) => `No results for “${query}”.`,
  },
  toolsPage: {
    kicker: "SABBARA LAB",
    title: "The verification kit",
    lead: "Everything the newsroom uses before a story reaches you — images, voice, language, and sources.",
    count: (n) => `${n} tools`,
    openTool: "Open tool",
    allFilter: "All",
  },
  about: {
    title: "About us",
    kicker: "Community Development and Media Center",
    lead: "A just and democratic society in which the media contributes to promoting human rights, citizenship, freedom, and social justice.",
    collageAlt:
      "About the Center — programmes and activities of the Community Development and Media Center",
    visionTitle: "Our vision",
    visionBody:
      "The Center’s vision reflects a long-term aspiration to help build a society in which the media strengthens democratic values, human rights, citizenship, and social justice. In the Palestinian context, and especially in the Gaza Strip, this vision affirms the role of media in amplifying voices, deepening civic participation, and contributing to positive social change.",
    visionQuote:
      "A just and democratic society in which the media contributes to promoting human rights, citizenship, freedom, and social justice.",
    missionTitle: "Our mission",
    missionBody:
      "The Center’s mission reflects its role as a civil-society organization working at the intersection of media, human rights, and community development. It focuses on empowering journalists, youth, women, and other marginalized groups through media, civic participation, and rights-based development — contributing to greater participation, accountability, and social justice.",
    missionQuote:
      "The Community Development and Media Center is an independent, non-profit civil-society organization that works to empower journalists, women, youth, and other marginalized groups through media, civic participation, and rights-based development, contributing to the promotion of human rights, accountability, and social justice.",
    philosophyTitle: "Our philosophy",
    philosophyBody:
      "The Center’s philosophy is grounded in the belief that lasting social change comes when people and communities can claim their rights, make their voices heard, and take part in public life. We see media not merely as a tool for communication, but as a platform for change, civic participation, accountability, social justice, and inclusive development — especially for marginalized and underrepresented groups.",
    valuesTitle: "Strategic values",
    valuesLead: "Our work is guided by these core values:",
    values: [
      {
        title: "Human rights",
        body: "The Center is committed to promoting and protecting human rights, and to grounding all of its work in dignity, equality, justice, and freedom.",
      },
      {
        title: "Participation",
        body: "The Center fosters active, inclusive participation so communities and the people we work with can shape decisions and help build lasting solutions.",
      },
      {
        title: "Social justice",
        body: "The Center works for fairness, equality, and inclusive development by confronting exclusion and the barriers facing marginalized and vulnerable groups.",
      },
      {
        title: "Accountability",
        body: "The Center is committed to transparency, responsibility, and accountability in its governance, partnerships, and programmes.",
      },
      {
        title: "Equity and inclusion",
        body: "The Center promotes equitable access to opportunity, representation, and services through an inclusive approach that values diversity and removes barriers to participation.",
      },
    ],
  },
};

export const PUBLIC_COPY: Record<Locale, PublicCopy> = { ar, en };

export function getPublicCopy(locale: Locale): PublicCopy {
  return PUBLIC_COPY[locale];
}
