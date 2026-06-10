import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { CheckCircle, Loader, Upload } from "lucide-react";
import type { SmartEditorTool } from "@/services/api/smart-editor";
import { useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useEditorForm from "../hooks/useEditorForm";
import PublishReadinessChecklist from "./publish-readiness-checklist";
import PublishingWorkflowStrip, {
  type PublishingWorkflowStep,
} from "./publishing-workflow-strip";
import SmartEditorPanel from "./smart-editor-panel";
import SourcesPanel from "./sources-panel";
import StandardsCheckPanel from "./standards-check-panel";

interface EditorFormProps {
  articleId?: number;
}

function resolveActiveStep(
  savedArticleId?: number,
  sourcesCount = 0,
  checkResult?: { canPublish: boolean } | null,
): PublishingWorkflowStep {
  if (!savedArticleId) return "write";
  if (sourcesCount === 0) return "source";
  if (!checkResult) return "check";
  return "publish";
}

export default function EditorForm({ articleId }: EditorFormProps) {
  const { t } = useTranslation();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const smartEditorRef = useRef<HTMLDivElement>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [smartEditorOpen, setSmartEditorOpen] = useState(false);
  const [suggestedTool, setSuggestedTool] = useState<SmartEditorTool | null>(
    null,
  );
  const {
    form,
    onSave,
    onCheck,
    onPublish,
    checkResult,
    savedArticleId,
    sources,
    addSource,
    removeSource,
    canPublish,
    publishReadiness,
    coverPreview,
    onCoverChange,
    onCoverImageError,
    saving,
    checking,
    publishing,
    addingSource,
    removingSource,
    isLoadingArticle,
    isReadOnly,
    publishedAt,
  } = useEditorForm(articleId);

  const activeStep = resolveActiveStep(savedArticleId, sources.length, checkResult);
  const articleContent = form.watch("content");

  const handleSuggestTool = (tool: SmartEditorTool) => {
    setSuggestedTool(tool);
    setSmartEditorOpen(true);
    requestAnimationFrame(() => {
      smartEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handlePublishClick = () => {
    if (!canPublish) return;
    setPublishDialogOpen(true);
  };

  const handleConfirmPublish = () => {
    setPublishDialogOpen(false);
    onPublish();
  };

  if (isLoadingArticle) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
        {isReadOnly ? (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <CheckCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">{t("journalist.editor.publishedBanner.title")}</p>
              <p className="mt-1 text-green-800">
                {publishedAt
                  ? t("journalist.editor.publishedBanner.publishedAt", {
                      date: new Date(publishedAt).toLocaleString(),
                    })
                  : t("journalist.editor.publishedBanner.subtitle")}
              </p>
              <Link
                to={ROUTES.JOURNALIST_ARCHIVE}
                className="mt-2 inline-block text-sm font-medium text-green-700 underline hover:text-green-900"
              >
                {t("journalist.editor.publishedBanner.viewArchive")}
              </Link>
            </div>
          </div>
        ) : null}

        <PublishingWorkflowStrip
          variant="compact"
          activeStep={activeStep}
          editorArticleId={savedArticleId}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="journalist-editor-card relative overflow-hidden lg:col-span-2">
            <div className="h-1 bg-accent-editor" />
            <CardHeader>
              <CardTitle className="font-headline text-base">
                {t("journalist.editor.articleDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <fieldset disabled={isReadOnly} className="space-y-6">
                <FormInput
                  name="title"
                  label={t("journalist.editor.title")}
                  required
                  columnView
                  placeholder={t("journalist.editor.titlePlaceholder")}
                />
                <FormInput
                  name="tags"
                  label={t("journalist.editor.tags")}
                  columnView
                  placeholder={t("journalist.editor.tagsPlaceholder")}
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t("journalist.editor.coverImage")}</p>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isReadOnly}
                    onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => coverInputRef.current?.click()}
                    className={cn(
                      "journalist-cover-upload flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center transition-colors hover:border-accent-editor/40 hover:bg-accent-editor/5",
                      coverPreview && "py-4",
                      isReadOnly && "pointer-events-none opacity-60",
                    )}
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt=""
                        onError={onCoverImageError}
                        className="max-h-36 rounded-md border border-border object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="size-6 text-accent-editor" />
                        <span className="text-sm text-muted-foreground">
                          {t("journalist.editor.coverUploadHint")}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <div ref={smartEditorRef}>
                  <FormTextarea
                    name="content"
                    label={t("journalist.editor.content")}
                    required
                    columnView
                    rows={14}
                    placeholder={t("journalist.editor.contentPlaceholder")}
                    toolbar={
                      isReadOnly ? undefined : (
                        <SmartEditorPanel
                          variant="inline"
                          form={form}
                          articleContent={articleContent}
                          readOnly={isReadOnly}
                          open={smartEditorOpen}
                          onOpenChange={setSmartEditorOpen}
                          suggestedTool={suggestedTool}
                          onSuggestedToolConsumed={() => setSuggestedTool(null)}
                        />
                      )
                    }
                  />
                </div>
              </fieldset>
              <SourcesPanel
                articleId={savedArticleId}
                sources={sources}
                onAddSource={addSource}
                onRemoveSource={removeSource}
                adding={addingSource}
                removing={removingSource}
                readOnly={isReadOnly}
              />
            </CardContent>
          </Card>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <StandardsCheckPanel
              result={checkResult}
              loading={checking}
              publishReadiness={publishReadiness}
              criterionLabel={(key) => t(`journalist.editor.criteria.${key}`)}
              onSuggestTool={isReadOnly ? undefined : handleSuggestTool}
            />

            {!isReadOnly ? (
              <Card className="journalist-editor-actions overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-accent-editor to-accent-editor-secondary" />
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-base">
                    {t("journalist.editor.publishingSteps")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader className="size-4 animate-spin" /> : null}
                    <span className="me-2 font-mono text-xs opacity-70">01</span>
                    {t("journalist.editor.saveDraft")}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCheck} disabled={checking}>
                    {checking ? <Loader className="size-4 animate-spin" /> : null}
                    <span className="me-2 font-mono text-xs opacity-70">03</span>
                    {t("journalist.editor.runCheck")}
                  </Button>
                  <Button
                    type="button"
                    disabled={!canPublish || publishing}
                    onClick={handlePublishClick}
                  >
                    {publishing ? <Loader className="size-4 animate-spin" /> : null}
                    <span className="me-2 font-mono text-xs opacity-70">04</span>
                    {t("journalist.editor.publish")}
                  </Button>
                  <PublishReadinessChecklist readiness={publishReadiness} className="pt-2" />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </form>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("journalist.editor.publishConfirm.title")}</DialogTitle>
            <DialogDescription>
              {t("journalist.editor.publishConfirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
              {t("BTN.CANCEL")}
            </Button>
            <Button onClick={handleConfirmPublish} disabled={publishing}>
              {publishing ? <Loader className="size-4 animate-spin" /> : null}
              {t("journalist.editor.publishConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
