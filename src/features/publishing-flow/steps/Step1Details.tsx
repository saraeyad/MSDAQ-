import { Button } from "@/components/ui/button";
import { NextStepButton } from "@/features/publishing-flow/components/NextStepButton";
import { StepActionsRow } from "@/features/publishing-flow/components/StepActionsRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { sourceDisplayName } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { PublicCategories_APIs } from "@/services/api/public-categories";
import type {
  ArticleSource,
  CreateSourcePayload,
  SourceType,
  StaffArticle,
  StaffMediaType,
} from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Layers,
  Link2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MEDIA_TYPES: { value: StaffMediaType; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "audio", label: "صوت" },
  { value: "video", label: "فيديو" },
];

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  url: "رابط",
  document: "مستند",
  person: "شخص",
  anonymous: "مجهول",
};

interface SourceDraft {
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
  onCreated?: (id: number, mediaType: StaffMediaType) => void;
  onComplete?: () => void;
}

function consentLabel(status?: ArticleSource["consent_status"]) {
  if (status === "pending") return "في انتظار الموافقة";
  if (status === "rejected") return "مرفوض";
  if (status === "approved") return "موافق";
  return null;
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof FileText;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("publish-form-section", className)}>
      <header className="publish-form-section__header">
        <span className="publish-form-section__icon" aria-hidden>
          <Icon className="size-4" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="publish-form-section__title">{title}</h3>
          {description ? (
            <p className="publish-form-section__desc">{description}</p>
          ) : null}
        </div>
      </header>
      <div className="publish-form-section__body">{children}</div>
    </section>
  );
}

function FieldGroup({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("publish-field", className)}>
      <Label className="publish-field__label">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
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
  const [sources, setSources] = useState<SourceDraft[]>([
    {
      type: "url",
      label: "",
      url: "",
      name: "",
      phone: "",
      email: "",
      quote: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: () => PublicCategories_APIs.list(),
  });

  const addSource = () =>
    setSources((s) => [
      ...s,
      {
        type: "url",
        label: "",
        url: "",
        name: "",
        phone: "",
        email: "",
        quote: "",
      },
    ]);

  const removeSource = (i: number) =>
    setSources((s) => s.filter((_, idx) => idx !== i));

  const updateSource = (i: number, field: keyof SourceDraft, value: string) =>
    setSources((s) =>
      s.map((src, idx) => (idx === i ? { ...src, [field]: value } : src)),
    );

  const buildSourcePayload = (s: SourceDraft): CreateSourcePayload => {
    const base: CreateSourcePayload = { type: s.type };
    if (s.type === "url") {
      return { ...base, label: s.label || undefined, url: s.url };
    }
    if (s.type === "person") {
      return {
        ...base,
        name: s.name,
        email: s.email,
        phone: s.phone || undefined,
        quote: s.quote,
      };
    }
    if (s.type === "document" || s.type === "anonymous") {
      return { ...base, label: s.label || undefined };
    }
    return base;
  };

  const isSourceValid = (s: SourceDraft) => {
    if (s.type === "url") return !!s.url.trim();
    if (s.type === "person") {
      return !!s.name.trim() && !!s.email.trim() && !!s.quote.trim();
    }
    return !!s.label.trim();
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
        await ArticlesStaff_APIs.updateArticle(article.id, {
          title,
          description: trimmedDescription || null,
          category_id: Number(categoryId),
          media_url:
            mediaType !== "text" && mediaUrl.trim() ? mediaUrl.trim() : null,
        });
        await queryClient.invalidateQueries({
          queryKey: ["staff-article", String(article.id)],
        });
        toast.success("تم حفظ التفاصيل");
        onComplete?.();
        return;
      }

      const validSources = sources
        .filter(isSourceValid)
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
      });
      toast.success("تم إنشاء المسودة");
      onCreated?.(created.id, created.media_type);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !!title.trim() &&
    !!categoryId &&
    (isEdit || sources.some(isSourceValid));

  return (
    <div className="publish-step">
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
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name_ar}
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
        icon={Link2}
        title="المصادر"
        description={
          isEdit
            ? "المصادر المسجّلة عند الإنشاء"
            : "أضف مصدراً واحداً على الأقل — مصادر الأشخاص تتطلب موافقة بالبريد"
        }
      >
        {isEdit && article ? (
          <div className="space-y-2">
            {article.sources.map((source) => {
              const consent = consentLabel(source.consent_status);
              return (
                <div key={source.id} className="publish-source-readonly">
                  <span className="font-medium">{sourceDisplayName(source)}</span>
                  <span className="text-muted-foreground">
                    {SOURCE_TYPE_LABELS[source.source_type as SourceType] ??
                      source.source_type}
                    {consent ? ` · ${consent}` : ""}
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              لتعديل المصادر تواصل مع المشرف.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sources.map((source, i) => (
              <div key={i} className="publish-source-card">
                <div className="publish-source-card__header">
                  <span className="publish-source-card__index">
                    مصدر {i + 1}
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
                        placeholder="البريد الإلكتروني (موافقة المصدر)"
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
                        placeholder="الاقتباس المنسوب للمصدر"
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
                      placeholder="التسمية"
                      value={source.label}
                      onChange={(e) =>
                        updateSource(i, "label", e.target.value)
                      }
                      className="publish-input"
                    />
                  )}
                </div>
              </div>
            ))}

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
        )}
      </FormSection>

      {error ? (
        <div className="publish-form-error" role="alert">
          {error}
        </div>
      ) : null}

      <StepActionsRow className="publish-step-actions">
        <NextStepButton
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          loading={loading}
        >
          {isEdit ? undefined : "حفظ والمتابعة"}
        </NextStepButton>
      </StepActionsRow>
    </div>
  );
}
