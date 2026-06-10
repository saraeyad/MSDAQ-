import type {
  JournalistArticle,
  StandardsCheckResult,
} from "@/types/journalist-article";

let articles: JournalistArticle[] = [
  {
    id: 1,
    title: "مسودة: تحليل الاقتصاد العربي",
    content: "هذا نص تجريبي بالفصحى يتحدث عن الاقتصاد العربي والتحديات المستقبلية.",
    status: "draft",
    trustScore: null,
    credibilityScore: null,
    sources: [{ id: 1, label: "تقرير البنك الدولي", type: "url", url: "https://example.com" }],
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-05-22T14:00:00Z",
  },
  {
    id: 2,
    title: "تقرير: الإعلام والذكاء الاصطناعي",
    content: "يتناول هذا المقال تأثير الذكاء الاصطناعي على صناعة الإعلام العربي.",
    status: "pending",
    trustScore: 72,
    credibilityScore: 78,
    sources: [
      { id: 1, label: "دراسة أكاديمية", type: "document" },
      { id: 2, label: "خبير تقني", type: "person" },
    ],
    createdAt: "2026-05-18T09:00:00Z",
    updatedAt: "2026-05-25T11:00:00Z",
    submittedAt: "2026-05-25T11:00:00Z",
  },
  {
    id: 3,
    title: "تحقيق: حرية الصحافة",
    content: "تحقيق موسع حول أوضاع حرية الصحافة في المنطقة العربية.",
    status: "published",
    trustScore: 85,
    credibilityScore: 88,
    sources: [{ id: 1, label: "منظمة مراسلون بلا حدود", type: "url", url: "https://example.com/rsf" }],
    createdAt: "2026-05-10T08:00:00Z",
    updatedAt: "2026-05-15T16:00:00Z",
    submittedAt: "2026-05-12T10:00:00Z",
    publishedAt: "2026-05-15T16:00:00Z",
  },
  {
    id: 4,
    title: "مقال مرفوض: عناوين مضللة",
    content: "هذا المقال يحتوي على ادعاءات غير موثقة بشكل كافٍ.",
    status: "rejected",
    trustScore: 42,
    credibilityScore: 55,
    rejectionReason: "المصادر غير كافية والادعاءات تحتاج تحقق إضافي.",
    sources: [{ id: 1, label: "مصدر مجهول", type: "anonymous" }],
    createdAt: "2026-05-08T12:00:00Z",
    updatedAt: "2026-05-14T09:00:00Z",
    submittedAt: "2026-05-12T08:00:00Z",
  },
];

let nextId = 5;

export function getJournalistArticles(status?: JournalistArticle["status"]) {
  const list = [...articles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return status ? list.filter((a) => a.status === status) : list;
}

export function getJournalistArticle(id: number) {
  return articles.find((a) => a.id === id) ?? null;
}

export function saveJournalistArticle(
  payload: Pick<JournalistArticle, "title" | "content" | "sources"> & { id?: number }
) {
  if (payload.id) {
    const index = articles.findIndex((a) => a.id === payload.id);
    if (index >= 0) {
      articles[index] = {
        ...articles[index],
        title: payload.title,
        content: payload.content,
        sources: payload.sources,
        updatedAt: new Date().toISOString(),
      };
      return articles[index];
    }
  }

  const article: JournalistArticle = {
    id: nextId++,
    title: payload.title,
    content: payload.content,
    sources: payload.sources,
    status: "draft",
    trustScore: null,
    credibilityScore: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  articles = [article, ...articles];
  return article;
}

export function runStandardsCheck(content: string): StandardsCheckResult {
  const dialectDetected = /(?:شو|كيفك|يلا|هيك)/.test(content);
  const fushaCompliant = !dialectDetected && content.length >= 20;
  const trustScore = fushaCompliant
    ? Math.min(95, 50 + Math.floor(content.length / 10))
    : Math.max(30, 40 + Math.floor(content.length / 20));
  const credibilityScore = trustScore + 5;
  const issues: string[] = [];

  if (dialectDetected) issues.push("dialect");
  if (!fushaCompliant) issues.push("fusha");
  if (content.length < 50) issues.push("length");

  return {
    trustScore,
    credibilityScore,
    fushaCompliant,
    dialectDetected,
    canPublish: trustScore >= 65 && fushaCompliant && !dialectDetected,
    breakdown: [],
    issues,
  };
}

export function submitArticleForReview(id: number) {
  const index = articles.findIndex((a) => a.id === id);
  if (index < 0) return null;

  const check = runStandardsCheck(articles[index].content);
  if (!check.canPublish) return null;

  articles[index] = {
    ...articles[index],
    status: "pending",
    trustScore: check.trustScore,
    credibilityScore: check.credibilityScore,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return articles[index];
}

export function adminReviewArticle(
  id: number,
  action: "approve" | "reject",
  rejectionReason?: string
) {
  const index = articles.findIndex((a) => a.id === id);
  if (index < 0 || articles[index].status !== "pending") return null;

  articles[index] = {
    ...articles[index],
    status: action === "approve" ? "published" : "rejected",
    rejectionReason: action === "reject" ? rejectionReason : undefined,
    publishedAt: action === "approve" ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };
  return articles[index];
}

export function getPendingArticlesForAdmin() {
  return articles.filter((a) => a.status === "pending");
}
