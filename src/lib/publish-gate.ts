import type {
  ArticleSource,
  DerivedPublishGate,
  PublishGateCheck,
  StaffArticle,
  StaffMediaType,
} from "@/types";

const PUBLISHING_STEPS = [
  { num: 1, label: "التفاصيل والمصادر" },
  { num: 2, label: "صورة الغلاف" },
  { num: 3, label: "المحتوى" },
  { num: 4, label: "فحص المعايير" },
  { num: 5, label: "فحص المصداقية" },
  { num: 6, label: "التبسيط واللهجة" },
  { num: 7, label: "النشر" },
] as const;

const TEXT_ONLY_STEPS = new Set<number>([3, 4, 5, 6]);

export function stepsForMediaType(mediaType: StaffMediaType) {
  return PUBLISHING_STEPS.filter(
    (step) => !TEXT_ONLY_STEPS.has(step.num) || mediaType === "text",
  );
}

export function stepCountForMediaType(mediaType: StaffMediaType): number {
  return stepsForMediaType(mediaType).length;
}

export function stepLabel(stepNum: number): string {
  return (
    PUBLISHING_STEPS.find((s) => s.num === stepNum)?.label ??
    `الخطوة ${stepNum}`
  );
}

/** 1-based position in the visible stepper (e.g. audio step 5 → display 3). */
export function displayStepNumber(
  internalStep: number,
  mediaType: StaffMediaType,
): number {
  const steps = stepsForMediaType(mediaType);
  const idx = steps.findIndex((s) => s.num === internalStep);
  return idx >= 0 ? idx + 1 : internalStep;
}

export function formatStepProgress(
  internalStep: number,
  mediaType: StaffMediaType,
): string {
  const label = stepLabel(internalStep);
  const display = displayStepNumber(internalStep, mediaType);
  const total = stepCountForMediaType(mediaType);
  return `${label} (${display}/${total})`;
}

export function isStepVisible(
  step: number,
  mediaType: StaffMediaType,
): boolean {
  return stepsForMediaType(mediaType).some((s) => s.num === step);
}

export function getNextStep(
  currentStep: number,
  mediaType: StaffMediaType,
): number {
  const steps = stepsForMediaType(mediaType).map((s) => s.num);
  const idx = steps.findIndex((s) => s === currentStep);
  if (idx >= 0 && idx < steps.length - 1) {
    return steps[idx + 1]!;
  }
  return Math.min(currentStep + 1, 7);
}

export function getPreviousStep(
  currentStep: number,
  mediaType: StaffMediaType,
): number {
  const steps = stepsForMediaType(mediaType).map((s) => s.num);
  const idx = steps.findIndex((s) => s === currentStep);
  if (idx > 0) {
    return steps[idx - 1]!;
  }
  return steps[0] ?? 1;
}

function hasDescription(article: Pick<StaffArticle, "description">): boolean {
  return !!article.description?.trim();
}

function hasContentFormal(article: Pick<StaffArticle, "content">): boolean {
  return !!article.content?.formal?.trim();
}

function hasLocalization(article: Pick<StaffArticle, "content">): boolean {
  return !!(
    article.content?.simplified?.trim() || article.content?.dialect?.trim()
  );
}

function hasAudioAsset(
  article: Pick<StaffArticle, "source_audio" | "media_url">,
): boolean {
  return !!(article.source_audio?.trim() || article.media_url?.trim());
}

function hasVideoReady(
  article: Pick<StaffArticle, "media_url" | "video" | "video_status">,
): boolean {
  if (article.media_url?.trim()) return true;
  return article.video_status === "ready" && !!article.video?.trim();
}

function articleSources(sources: ArticleSource[] | undefined): ArticleSource[] {
  return sources ?? [];
}

function personConsentsClear(sources: ArticleSource[] | undefined): boolean {
  const personSources = articleSources(sources).filter(
    (s) => s.source_type === "person",
  );
  return (
    personSources.length === 0 ||
    personSources.every(
      (s) => !s.consent_status || s.consent_status === "approved",
    )
  );
}

export function hasMetadataComplete(
  article: Pick<StaffArticle, "title" | "description" | "sources" | "category">,
): boolean {
  return (
    !!article.title?.trim() &&
    articleSources(article.sources).length >= 1 &&
    !!article.category?.id &&
    personConsentsClear(article.sources)
  );
}

export function mediaStepComplete(
  article: Pick<
    StaffArticle,
    | "media_type"
    | "cover_image"
    | "source_audio"
    | "media_url"
    | "video"
    | "video_status"
  >,
): boolean {
  const hasCover = !!article.cover_image?.trim();

  switch (article.media_type) {
    case "text":
      return hasCover;
    case "audio":
      return hasCover && hasAudioAsset(article);
    case "video":
      return hasCover && hasVideoReady(article);
    default:
      return hasCover;
  }
}

/** Required steps only — step 6 (localization) is optional. */
export function isRequiredStepComplete(
  step: number,
  article: StaffArticle,
): boolean {
  switch (step) {
    case 1:
      return hasMetadataComplete(article);
    case 2:
      return mediaStepComplete(article);
    case 3:
      return article.media_type !== "text" || hasContentFormal(article);
    case 4:
      return (
        article.media_type !== "text" || article.gate?.fusha_passed === true
      );
    case 5:
      return (
        article.media_type !== "text" ||
        !!article.gate?.credibility_checked_at
      );
    case 6:
      return true;
    case 7:
      return article.status === "published" || article.status === "scheduled";
    default:
      return false;
  }
}

/** Whether a step has real content — used for stepper checkmarks. */
export function isStepFilled(step: number, article: StaffArticle): boolean {
  if (step === 6) {
    return article.media_type === "text" && hasLocalization(article);
  }
  return isRequiredStepComplete(step, article);
}

/**
 * First step the journalist should work on (next incomplete required step).
 * Optional localization (6) is suggested after credibility when no variants exist.
 */
export function inferArticleStep(article: StaffArticle): number {
  if (article.status === "published" || article.status === "scheduled") {
    return 7;
  }

  const steps = stepsForMediaType(article.media_type).map((s) => s.num);

  for (const step of steps) {
    if (step === 6) {
      if (
        isRequiredStepComplete(5, article) &&
        !hasLocalization(article) &&
        article.media_type === "text"
      ) {
        return 6;
      }
      continue;
    }

    if (!isRequiredStepComplete(step, article)) {
      return step;
    }
  }

  return 7;
}

/**
 * Highest step reachable without skipping ahead of incomplete required work.
 * After credibility (text), step 7 is allowed even if localization was skipped.
 */
export function maxAllowedStep(article: StaffArticle): number {
  if (article.status === "published" || article.status === "scheduled") {
    return 7;
  }

  const steps = stepsForMediaType(article.media_type).map((s) => s.num);
  let allowed: number = steps[0] ?? 1;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    allowed = step;

    if (!isRequiredStepComplete(step, article)) {
      break;
    }

    if (i + 1 < steps.length) {
      allowed = steps[i + 1]!;
    }
  }

  if (
    article.media_type === "text" &&
    isRequiredStepComplete(5, article)
  ) {
    allowed = Math.max(allowed, 7);
  }

  if (
    (article.media_type === "audio" || article.media_type === "video") &&
    isRequiredStepComplete(2, article)
  ) {
    allowed = Math.max(allowed, 7);
  }

  return allowed;
}

export function clampArticleStep(
  requestedStep: number,
  article: StaffArticle,
): number {
  const visible = stepsForMediaType(article.media_type).map((s) => s.num);
  if (!visible.includes(requestedStep as (typeof visible)[number])) {
    return visible[0] ?? 1;
  }

  return requestedStep;
}

export function derivePublishGate(
  article: Pick<
    StaffArticle,
    | "description"
    | "media_type"
    | "gate"
    | "sources"
    | "content"
    | "source_audio"
    | "media_url"
    | "video"
    | "video_status"
    | "cover_image"
  >,
): DerivedPublishGate {
  const { gate, media_type } = article;
  const sources = articleSources(article.sources);
  const has_sources = sources.length >= 1;
  const consents_clear = personConsentsClear(sources);
  const credibility_score = gate?.credibility_score ?? null;

  const checks: PublishGateCheck[] = [
    {
      label: "الوصف (اختياري)",
      passed: hasDescription(article),
      blocking: false,
    },
    {
      label: "مصدر واحد على الأقل",
      passed: has_sources,
      blocking: true,
    },
    {
      label: "موافقات المصادر مكتملة",
      passed: consents_clear,
      blocking: true,
    },
  ];

  if (media_type === "text") {
    checks.push(
      {
        label: "المحتوى بالفصحى",
        passed: hasContentFormal(article),
        blocking: true,
      },
      {
        label: "اجتياز فحص المعايير (فصحى)",
        passed: gate?.fusha_passed === true,
        blocking: true,
      },
    );
  }

  if (media_type === "audio") {
    checks.push({
      label: "ملف صوتي أو رابط SoundCloud",
      passed: hasAudioAsset(article),
      blocking: true,
    });
    checks.push({
      label: "صورة الغلاف",
      passed: !!article.cover_image?.trim(),
      blocking: true,
    });
  }

  if (media_type === "video") {
    checks.push({
      label: "فيديو جاهز أو رابط YouTube",
      passed: hasVideoReady(article),
      blocking: true,
    });
    checks.push({
      label: "صورة الغلاف",
      passed: !!article.cover_image?.trim(),
      blocking: true,
    });
  }

  if (media_type === "text") {
    checks.push({
      label: "صورة الغلاف",
      passed: !!article.cover_image?.trim(),
      blocking: true,
    });
  }

  if (credibility_score != null) {
    checks.push({
      label: `درجة المصداقية (${credibility_score}) — إرشادية`,
      passed: true,
      blocking: false,
    });
  }

  const can_publish = checks.filter((c) => c.blocking).every((c) => c.passed);

  return {
    media_type,
    checks,
    credibility_score,
    can_publish,
  };
}

export function sourceDisplayName(source: ArticleSource): string {
  return source.source;
}
