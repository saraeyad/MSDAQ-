import { errorToast } from "@/components/sonner-toast";
import FormInput from "@/components/form/form-input";
import FormSelect from "@/components/form/form-select";
import FormTextarea from "@/components/form/form-textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArticleSourceType, JournalistArticleSource } from "@/types/journalist-article";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

type SourceDraft = {
  type: ArticleSourceType;
  url?: string;
  name?: string;
  email?: string;
  phone?: string;
  quote?: string;
  label?: string;
};

interface SourcesPanelProps {
  articleId?: number;
  sources: JournalistArticleSource[];
  onAddSource: (source: SourceDraft) => void;
  onRemoveSource: (sourceId: number) => void;
  adding?: boolean;
  removing?: boolean;
  readOnly?: boolean;
}

const SOURCE_TYPES: ArticleSourceType[] = [
  "url",
  "document",
  "person",
  "anonymous",
  "organization",
  "public_figure",
];

export default function SourcesPanel({
  articleId,
  sources,
  onAddSource,
  onRemoveSource,
  adding,
  removing,
  readOnly = false,
}: SourcesPanelProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<SourceDraft>({
    defaultValues: {
      type: "url",
      url: "",
      name: "",
      email: "",
      phone: "",
      quote: "",
      label: "",
    },
  });

  const sourceType = form.watch("type");
  const isHumanSource = sourceType === "person";

  const handleAdd = (data: SourceDraft) => {
    if (!articleId || readOnly) return;
    if (data.type === "url" && !data.url?.trim()) {
      errorToast(t("journalist.editor.sourceUrlRequired"));
      return;
    }
    if (data.type === "person") {
      if (!data.name?.trim() || !data.email?.trim() || !data.phone?.trim() || !data.quote?.trim()) {
        errorToast(t("journalist.editor.sourceHumanRequired"));
        return;
      }
    }
    if (data.type !== "url" && data.type !== "person" && !data.label?.trim()) {
      errorToast(t("journalist.editor.sourceLabelRequired"));
      return;
    }
    onAddSource(data);
    form.reset({
      type: "url",
      url: "",
      name: "",
      email: "",
      phone: "",
      quote: "",
      label: "",
    });
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-base">
          {t("journalist.editor.sourcesTitle")}
        </CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!articleId || adding || readOnly}
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus className="size-4" />
          {t("journalist.editor.addSource")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!articleId ? (
          <p className="text-sm text-muted-foreground">
            {t("journalist.editor.sourcesRequireDraft")}
          </p>
        ) : null}

        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("journalist.editor.noSources")}
          </p>
        ) : (
          sources.map((source, index) => (
            <div key={source.id} className="space-y-2 border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {t("journalist.editor.source")} {index + 1}
                  </p>
                  <p className="text-sm text-foreground">{source.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {t(`articles.sourceType.${source.type}`)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={removing || readOnly}
                  onClick={() => onRemoveSource(source.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {source.isVerified ? (
                  <Badge variant="success">{t("journalist.editor.sourceVerified")}</Badge>
                ) : null}
                {source.consent ? (
                  <Badge
                    variant={
                      source.consent.status === "approved"
                        ? "success"
                        : source.consent.status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {t(`journalist.editor.consent.${source.consent.status}`)}
                  </Badge>
                ) : null}
              </div>

              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-xs text-secondary hover:underline"
                >
                  {source.url}
                </a>
              ) : null}
            </div>
          ))
        )}

        {showForm && articleId ? (
          <FormProvider {...form}>
            <div className="space-y-3 border border-dashed border-border p-4">
              <FormSelect
                name="type"
                label={t("journalist.editor.sourceType")}
                required
                columnView
                isStringValue
                options={SOURCE_TYPES.map((type) => ({
                  LABEL: t(`articles.sourceType.${type}`),
                  VALUE: type,
                }))}
              />

              {sourceType === "url" ? (
                <FormInput
                  name="url"
                  label={t("journalist.editor.sourceUrl")}
                  required
                  columnView
                />
              ) : null}

              {isHumanSource ? (
                <>
                  <FormInput
                    name="name"
                    label={t("journalist.editor.sourceName")}
                    required
                    columnView
                  />
                  <FormInput
                    name="email"
                    label={t("journalist.editor.sourceEmail")}
                    required
                    columnView
                  />
                  <FormInput
                    name="phone"
                    label={t("journalist.editor.sourcePhone")}
                    required
                    columnView
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("journalist.editor.sourcePhoneHint")}
                  </p>
                  <FormTextarea
                    name="quote"
                    label={t("journalist.editor.sourceQuote")}
                    required
                    columnView
                    rows={3}
                  />
                </>
              ) : (
                <FormInput
                  name="label"
                  label={t("journalist.editor.sourceLabel")}
                  required
                  columnView
                />
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={adding}
                  onClick={form.handleSubmit(handleAdd)}
                >
                  {adding ? <Loader className="size-4 animate-spin" /> : null}
                  {t("journalist.editor.saveSource")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  {t("BTN.CANCEL")}
                </Button>
              </div>
            </div>
          </FormProvider>
        ) : null}
      </CardContent>
    </Card>
  );
}
