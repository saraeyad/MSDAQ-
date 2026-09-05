import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup } from "@/features/publishing-flow/steps/Step1Details/FieldGroup";
import { FormSection } from "@/features/publishing-flow/steps/Step1Details/FormSection";
import {
  flattenCategoriesForSelect,
  formatCategorySelectLabel,
} from "@/lib/category-tree";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { usePublicCategories } from "@/hooks/usePublicCategories";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import type {
  ArticleSource,
  CreateSourcePayload,
  SourceType,
  StaffArticle,
  StaffMediaType,
  UpdateSourcePayload,
} from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Gauge,
  Layers,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const MEDIA_TYPES: { value: StaffMediaType; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "audio", label: "صوت" },
  { value: "video", label: "فيديو" },
];

const EMPTY_SOURCE: SourceDraft = {
  type: "url",
  label: "",
  url: "",
  name: "",
  phone: "",
  email: "",
  quote: "",
};

interface SourceDraft {
  id?: number;
  type: SourceType;
  label: string;
  url: string;
  name: string;
  phone: string;
  email: string;
  quote: string;
}

interface Step1DetailsProps {
  article?: StaffArticle;
  onCreated?: (id: number | string, mediaType: StaffMediaType) => void;
  onComplete?: () => void;
}

function consentLabel(status?: ArticleSource["consent_status"]) {
  if (status === "pending") return "في انتظار الموافقة";
  if (status === "rejected") return "مرفوض";
  if (status === "approved") return "موافق";
  return null;
}

function sourceDraftFromArticle(source: ArticleSource): SourceDraft {
  if (source.source_type === "url") {
    return {
      id: source.id,
      type: "url",
      label: "",
      url: source.source,
      name: "",
      phone: "",
      email: "",
      quote: "",
    };
  }
  if (source.source_type === "person") {
    return {
      id: source.id,
      type: "person",
      label: "",
      url: "",
      name: source.source,
      phone: "",
      email: "",
      quote: "",
    };
  }
  return {
    id: source.id,
    type: source.source_type,
    label: source.source,
    url: "",
    name: "",
    phone: "",
    email: "",
    quote: "",
  };
}

function initialSources(article?: StaffArticle): SourceDraft[] {
  if (article?.sources.length) {
    return article.sources.map(sourceDraftFromArticle);
  }
  return [{ ...EMPTY_SOURCE }];
}

function parseOptionalThreshold(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return Math.round(parsed);
}

function validateThresholds(target?: number, limit?: number) {
  if (target != null && limit != null && limit < target) {
    throw new Error("حد الاستجابات يجب أن يكون أكبر من أو يساوي هدف التقييم");
  }
}

function buildSourcePayload(s: SourceDraft): CreateSourcePayload {
  const base: CreateSourcePayload = { type: s.type };
  if (s.type === "url") {
    return { ...base, label: s.label.trim() || undefined, url: s.url.trim() };
  }
  if (s.type === "person") {
    return {
      ...base,
      name: s.name.trim(),
      email: s.email.trim(),
      phone: s.phone.trim() || undefined,
      quote: s.quote.trim(),
    };
  }
  if (s.type === "document" || s.type === "anonymous") {
    return { ...base, label: s.label.trim() || undefined };
  }
  return base;
}

function buildUpdateSourcePayload(s: SourceDraft): UpdateSourcePayload {
  if (s.id == null) {
    return buildSourcePayload(s);
  }

  if (s.type === "person") {
    const email = s.email.trim();
    const quote = s.quote.trim();
    if (!email && !quote) {
      return {
        id: s.id,
        type: "person",
        name: s.name.trim(),
        ...(s.phone.trim() ? { phone: s.phone.trim() } : {}),
      };
    }
    return { ...buildSourcePayload(s), id: s.id };
  }

  return { ...buildSourcePayload(s), id: s.id };
}

function isSourceValid(s: SourceDraft, isEdit: boolean) {
  if (s.type === "url") return !!s.url.trim();
  if (s.type === "person") {
    if (!s.name.trim()) return false;
    if (!isEdit || s.id == null) {
      return !!s.email.trim() && !!s.quote.trim();
    }
    const hasEmail = !!s.email.trim();
    const hasQuote = !!s.quote.trim();
    if (hasEmail || hasQuote) return hasEmail && hasQuote;
    return true;
  }
  return true;
}

function personConsentWillResend(s: SourceDraft) {
  return (
    s.type === "person" &&
    s.id != null &&
    (!!s.email.trim() || !!s.quote.trim())
  );
}

export function Step1Details({
  article,
  onCreated,
  onComplete,
}: Step1DetailsProps) {
  const isEdit = !!article;
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [mediaType, setMediaType] = useState<StaffMediaType>(
    article?.media_type ?? "text",
  );
  const [categoryId, setCategoryId] = useState(
    article?.category?.id ? String(article.category.id) : "",
  );
  const [mediaUrl, setMediaUrl] = useState(article?.media_url ?? "");
  const [reviewTarget, setReviewTarget] = useState(
    article?.review_target != null ? String(article.review_target) : "",
  );
  const [reviewLimit, setReviewLimit] = useState(
    article?.review_limit != null ? String(article.review_limit) : "",
  );
  const [sources, setSources] = useState<SourceDraft[]>(() =>
    initialSources(article),
  );
  const [sourcesDirty, setSourcesDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const consentBySourceId = useMemo(() => {
    const map = new Map<number, ArticleSource["consent_status"]>();
    for (const source of article?.sources ?? []) {
      if (source.consent_status) {
        map.set(source.id, source.consent_status);
      }
    }
    return map;
  }, [article?.sources]);

  const { data: categories, isLoading: categoriesLoading } = usePublicCategories();

  const categoryOptions = useMemo(
    () => flattenCategoriesForSelect(categories ?? []),
    [categories],
  );

  const markSourcesDirty = () => setSourcesDirty(true);

  const addSource = () => {
    markSourcesDirty();
    setSources((current) => [...current, { ...EMPTY_SOURCE }]);
  };

  const removeSource = (index: number) => {
    markSourcesDirty();
    setSources((current) => current.filter((_, idx) => idx !== index));
  };

  const updateSource = (
    index: number,
    field: keyof SourceDraft,
    value: string,
  ) => {
    markSourcesDirty();
    setSources((current) =>
      current.map((source, idx) =>
        idx === index ? { ...source, [field]: value } : source,
      ),
    );
  };

  const thresholdPayloadForCreate = () => {
    const target = parseOptionalThreshold(reviewTarget);
    const limit = parseOptionalThreshold(reviewLimit);
    validateThresholds(target, limit);
    return {
      ...(target != null ? { review_target: target } : {}),
      ...(limit != null ? { review_limit: limit } : {}),
    };
  };

  const thresholdPayloadForUpdate = () => {
    const target = parseOptionalThreshold(reviewTarget);
    const limit = parseOptionalThreshold(reviewLimit);
    validateThresholds(target, limit);
    return {
      review_target: reviewTarget.trim() ? (target ?? null) : null,
      review_limit: reviewLimit.trim() ? (limit ?? null) : null,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (!categoryId) {
        throw new Error("اختر التصنيف");
      }

      const trimmedDescription = description.trim();

      if (isEdit && article) {
        const payload = {
          title,
          description: trimmedDescription || null,
          category_id: Number(categoryId),
          media_url:
            mediaType !== "text" && mediaUrl.trim() ? mediaUrl.trim() : null,
          ...thresholdPayloadForUpdate(),
        };

        if (sourcesDirty) {
          const validSources = sources.filter((source) =>
            isSourceValid(source, true),
          );
          if (validSources.length === 0) {
            throw new Error("أضف مصدراً واحداً على الأقل");
          }
          Object.assign(payload, {
            sources: validSources.map(buildUpdateSourcePayload),
          });
        }

        await ArticlesStaff_APIs.updateArticle(article.id, payload);
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(article.id)],
        });
        toast.success("تم حفظ التفاصيل");
        onComplete?.();
        return;
      }

      const validSources = sources
        .filter((source) => isSourceValid(source, false))
        .map(buildSourcePayload);
      if (validSources.length === 0) {
        throw new Error("أضف مصدراً واحداً على الأقل");
      }

      const created = await ArticlesStaff_APIs.createArticle({
        title,
        description: trimmedDescription || null,
        media_type: mediaType,
        category_id: Number(categoryId),
        media_url:
          mediaType !== "text" && mediaUrl.trim() ? mediaUrl.trim() : undefined,
        sources: validSources,
        ...thresholdPayloadForCreate(),
      });
      toast.success("تم إنشاء المسودة");
      onCreated?.(created.id, created.media_type);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const sourcesValid =
    !sourcesDirty || sources.some((source) => isSourceValid(source, isEdit));

  const canSubmit = !!title.trim() && !!categoryId && sourcesValid;

  const consentResendWarning =
    sourcesDirty && sources.some(personConsentWillResend);

  return (
    <div className="publish-step publish-step--details">
      <FormSection
        icon={FileText}
        title="المعلومات الأساسية"
        description="العنوان يظهر في البطاقات وبوابة النشر — الوصف اختياري"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="العنوان" required className="sm:col-span-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان المقال"
              className="publish-input"
            />
          </FieldGroup>
          <FieldGroup label="الوصف (اختياري)" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ملخص قصير يظهر في البطاقات — اختياري"
              rows={3}
              className="publish-input min-h-[5.5rem] resize-y"
            />
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection
        icon={Layers}
        title="التصنيف والنوع"
        description="يحدّد مسار النشر والخطوات التالية"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="نوع الوسائط">
            {isEdit ? (
              <Input
                value={mediaTypeLabel(mediaType)}
                disabled
                className="publish-input"
              />
            ) : (
              <Select
                value={mediaType}
                onValueChange={(v) => setMediaType(v as StaffMediaType)}
              >
                <SelectTrigger className="publish-input w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FieldGroup>
          <FieldGroup label="التصنيف" required>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="publish-input w-full">
                <SelectValue
                  placeholder={
                    categoriesLoading ? "جاري التحميل..." : "اختر التصنيف"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {formatCategorySelectLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          {mediaType !== "text" && (
            <FieldGroup
              label={
                mediaType === "audio"
                  ? "رابط SoundCloud (اختياري)"
                  : "رابط YouTube (اختياري)"
              }
              className="sm:col-span-2"
            >
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                dir="ltr"
                className="publish-input"
              />
            </FieldGroup>
          )}
        </div>
      </FormSection>

      <FormSection
        className="publish-form-section--trust"
        icon={Gauge}
        title="مؤشر ثقة الجمهور"
        description="اختياري — يتحكم في إشعار المؤلف وتوقف الاستطلاع العام"
      >
        <div className="publish-threshold-grid">
          <div className="publish-threshold-card">
            <p className="publish-threshold-card__kicker">إشعار المؤلف</p>
            <FieldGroup label="هدف التقييم">
              <div className="publish-threshold-input">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={reviewTarget}
                  onChange={(e) => setReviewTarget(e.target.value)}
                  placeholder="مثال: 30"
                  className="publish-input publish-input--threshold"
                  aria-describedby="review-target-hint"
                />
                <span className="publish-threshold-input__suffix">استجابة</span>
              </div>
              <p id="review-target-hint" className="publish-field__hint">
                عند الوصول لهذا العدد يُرسل للمؤلف ملف Excel بالنتائج (مرة
                واحدة لكل قيمة).
              </p>
            </FieldGroup>
          </div>

          <div className="publish-threshold-card">
            <p className="publish-threshold-card__kicker">إيقاف الاستطلاع</p>
            <FieldGroup label="حد الاستجابات">
              <div className="publish-threshold-input">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={reviewLimit}
                  onChange={(e) => setReviewLimit(e.target.value)}
                  placeholder="مثال: 100"
                  className="publish-input publish-input--threshold"
                  aria-describedby="review-limit-hint"
                />
                <span className="publish-threshold-input__suffix">استجابة</span>
              </div>
              <p id="review-limit-hint" className="publish-field__hint">
                بعد هذا العدد يتوقف استقبال تقييمات القرّاء على المقال.
              </p>
            </FieldGroup>
          </div>
        </div>
      </FormSection>

      <FormSection
        icon={Link2}
        title="المصادر"
        description={
          isEdit
            ? "تعديل القائمة يستبدل المصادر بالكامل — اتركها دون تغيير إن أردت حفظ العنوان فقط"
            : "أضف مصدراً واحداً على الأقل — مصادر الأشخاص تتطلب موافقة بالبريد"
        }
      >
        {consentResendWarning ? (
          <p className="publish-consent-warn">
            تغيير البريد أو الاقتباس لمصدر شخصي يرسل طلب موافقة جديداً ويلغي
            الرابط السابق.
          </p>
        ) : null}

        <div className="space-y-3">
          {sources.map((source, i) => {
            const consent =
              source.id != null
                ? consentLabel(consentBySourceId.get(source.id))
                : null;

            return (
              <div key={source.id ?? `new-${i}`} className="publish-source-card">
                <div className="publish-source-card__header">
                  <span className="publish-source-card__index">
                    مصدر {i + 1}
                    {consent ? (
                      <span className="text-muted-foreground"> · {consent}</span>
                    ) : null}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={source.type}
                      onValueChange={(v) => updateSource(i, "type", v)}
                    >
                      <SelectTrigger className="publish-source-card__type h-9 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">رابط</SelectItem>
                        <SelectItem value="document">مستند</SelectItem>
                        <SelectItem value="person">شخص</SelectItem>
                        <SelectItem value="anonymous">مجهول</SelectItem>
                      </SelectContent>
                    </Select>
                    {sources.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-muted-foreground hover:text-destructive"
                        onClick={() => removeSource(i)}
                        aria-label="حذف المصدر"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="publish-source-card__fields">
                  {source.type === "url" && (
                    <>
                      <Input
                        placeholder="التسمية (اختياري)"
                        value={source.label}
                        onChange={(e) =>
                          updateSource(i, "label", e.target.value)
                        }
                        className="publish-input"
                      />
                      <Input
                        placeholder="الرابط"
                        value={source.url}
                        onChange={(e) => updateSource(i, "url", e.target.value)}
                        dir="ltr"
                        className="publish-input"
                      />
                    </>
                  )}

                  {source.type === "person" && (
                    <>
                      <Input
                        placeholder="اسم الشخص"
                        value={source.name}
                        onChange={(e) =>
                          updateSource(i, "name", e.target.value)
                        }
                        className="publish-input"
                      />
                      <Input
                        placeholder={
                          source.id
                            ? "البريد الإلكتروني — اتركه فارغاً إن لم تُغيّر الموافقة"
                            : "البريد الإلكتروني (موافقة المصدر)"
                        }
                        value={source.email}
                        onChange={(e) =>
                          updateSource(i, "email", e.target.value)
                        }
                        dir="ltr"
                        type="email"
                        className="publish-input"
                      />
                      <Input
                        placeholder="رقم الواتساب (+970...) — اختياري"
                        value={source.phone}
                        onChange={(e) =>
                          updateSource(i, "phone", e.target.value)
                        }
                        dir="ltr"
                        className="publish-input"
                      />
                      <Textarea
                        placeholder={
                          source.id
                            ? "الاقتباس — اتركه فارغاً إن لم تُغيّر الموافقة"
                            : "الاقتباس المنسوب للمصدر"
                        }
                        value={source.quote}
                        onChange={(e) =>
                          updateSource(i, "quote", e.target.value)
                        }
                        rows={3}
                        className="publish-input resize-y"
                      />
                    </>
                  )}

                  {(source.type === "document" ||
                    source.type === "anonymous") && (
                    <Input
                      placeholder="التسمية (اختياري)"
                      value={source.label}
                      onChange={(e) =>
                        updateSource(i, "label", e.target.value)
                      }
                      className="publish-input"
                    />
                  )}
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSource}
            className="publish-add-source"
          >
            <Plus className="size-4" />
            إضافة مصدر
          </Button>
        </div>
      </FormSection>

      {error ? (
        <div className="publish-form-error" role="alert">
          {error}
        </div>
      ) : null}

      <StepActionsRow className="publish-step-actions">
        {isEdit ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSubmit()}
              disabled={loading || !canSubmit}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              حفظ التفاصيل
            </Button>
            <NextStepButton onClick={() => onComplete?.()} disabled={loading} />
          </>
        ) : (
          <NextStepButton
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            loading={loading}
          >
            حفظ والمتابعة
          </NextStepButton>
        )}
      </StepActionsRow>
    </div>
  );
}
