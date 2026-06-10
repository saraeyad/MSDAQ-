import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import useSmartEditor from "@/hooks/useSmartEditor";
import { cn } from "@/lib/utils";
import type { JournalistEditorSchemaType } from "@/schemas/journalist-editor-schema";
import {
  isBulletPointsResult,
  SMART_EDITOR_TEXT_MAX_LENGTH,
  SMART_EDITOR_TOOLS,
  type SmartEditorTool,
} from "@/services/api/smart-editor";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Languages,
  List,
  Loader,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

type SmartEditorVariant = "sidebar" | "inline";

interface SmartEditorPanelProps {
  form: UseFormReturn<JournalistEditorSchemaType>;
  articleContent: string;
  readOnly?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedTool?: SmartEditorTool | null;
  onSuggestedToolConsumed?: () => void;
  variant?: SmartEditorVariant;
}

const TOOL_ICONS: Record<SmartEditorTool, LucideIcon> = {
  "rewrite-fusha": Languages,
  "neutralize-bias": Scale,
  "remove-discrimination": ShieldCheck,
  "bullet-points": List,
};

function replaceInContent(
  content: string,
  original: string,
  replacement: string,
): string {
  const index = content.indexOf(original);
  if (index === -1) return replacement;
  return (
    content.slice(0, index) + replacement + content.slice(index + original.length)
  );
}

interface SmartEditorToolCardProps {
  tool: SmartEditorTool;
  label: string;
  description: string;
  isActive: boolean;
  isRunning: boolean;
  disabled?: boolean;
  onSelect: (tool: SmartEditorTool) => void;
}

function SmartEditorToolCard({
  tool,
  label,
  description,
  isActive,
  isRunning,
  disabled,
  onSelect,
}: SmartEditorToolCardProps) {
  const Icon = TOOL_ICONS[tool];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "smart-editor-tool",
        isActive && "smart-editor-tool--active",
      )}
      onClick={() => onSelect(tool)}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-accent-editor/15 bg-accent-editor/10 text-accent-editor">
          {isRunning ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <Icon className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {label}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

interface SmartEditorCompactChipProps {
  tool: SmartEditorTool;
  label: string;
  isRunning: boolean;
  disabled?: boolean;
  onSelect: (tool: SmartEditorTool) => void;
}

function SmartEditorCompactChip({
  tool,
  label,
  isRunning,
  disabled,
  onSelect,
  compact = false,
}: SmartEditorCompactChipProps & { compact?: boolean }) {
  const Icon = TOOL_ICONS[tool];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "smart-editor-inline-chip",
        compact && "smart-editor-inline-chip--compact",
      )}
      onClick={() => onSelect(tool)}
      title={label}
      aria-label={label}
    >
      {isRunning ? (
        <Loader className="size-3 shrink-0 animate-spin" />
      ) : (
        <Icon className="size-3 shrink-0" />
      )}
      {!compact ? (
        <span className="smart-editor-inline-chip-label hidden sm:inline">
          {label}
        </span>
      ) : null}
    </button>
  );
}

function SmartEditorLoading({ steps }: { steps: string[] }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="smart-editor-loading">
      <div className="relative flex size-10 shrink-0 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-accent-editor/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <Sparkles className="relative size-4 text-accent-editor" />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={stepIndex}
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {steps[stepIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function SmartEditorPanel({
  form,
  articleContent,
  readOnly = false,
  open,
  onOpenChange,
  suggestedTool,
  onSuggestedToolConsumed,
  variant = "sidebar",
}: SmartEditorPanelProps) {
  const { t } = useTranslation();
  const { run, isRunning, result, activeTool, reset } = useSmartEditor();
  const [toolText, setToolText] = useState("");
  const [selectedTool, setSelectedTool] = useState<SmartEditorTool | null>(
    null,
  );
  const isInline = variant === "inline";

  const loadingSteps = t("journalist.smartEditor.loadingSteps", {
    returnObjects: true,
  }) as string[];

  const charCount = toolText.length;
  const isOverLimit = charCount > SMART_EDITOR_TEXT_MAX_LENGTH;
  const charProgress = Math.min(
    (charCount / SMART_EDITOR_TEXT_MAX_LENGTH) * 100,
    100,
  );
  const canRun =
    !readOnly &&
    !isRunning &&
    toolText.trim().length > 0 &&
    !isOverLimit &&
    selectedTool !== null;

  useEffect(() => {
    if (!suggestedTool) return;
    setSelectedTool(suggestedTool);
    setToolText(articleContent);
    onOpenChange(true);
    onSuggestedToolConsumed?.();
  }, [
    suggestedTool,
    articleContent,
    onOpenChange,
    onSuggestedToolConsumed,
  ]);

  const handleSelectTool = (tool: SmartEditorTool) => {
    if (isRunning) return;
    if (selectedTool === tool && toolText.trim()) {
      reset();
      run({ tool, text: toolText.trim() });
      return;
    }
    setSelectedTool(tool);
    reset();
  };

  const handleCompactToolSelect = (tool: SmartEditorTool) => {
    if (isRunning) return;
    setSelectedTool(tool);
    if (articleContent.trim()) {
      setToolText(articleContent);
    }
    reset();
    onOpenChange(true);
  };

  const handleRun = () => {
    if (!selectedTool || !canRun) return;
    reset();
    run({ tool: selectedTool, text: toolText.trim() });
  };

  const handleDismiss = () => {
    reset();
    setSelectedTool(null);
  };

  const handleApply = () => {
    if (!result) return;

    const currentContent = form.getValues("content") ?? "";

    if (isBulletPointsResult(result.data)) {
      const bulletText = result.data.points.map((point) => `- ${point}`).join("\n");
      const nextContent = replaceInContent(
        currentContent,
        result.data.original,
        bulletText,
      );
      form.setValue("content", nextContent, { shouldDirty: true });
    } else {
      const nextContent = replaceInContent(
        currentContent,
        result.data.original,
        result.data.result,
      );
      form.setValue("content", nextContent, { shouldDirty: true });
    }

    handleDismiss();
  };

  const handleUseArticleContent = () => {
    setToolText(articleContent);
  };

  if (readOnly) return null;

  const headerContent = isInline ? (
    <div className="smart-editor-inline-toolbar">
      <button
        type="button"
        className="smart-editor-inline-toggle"
        onClick={() => onOpenChange(!open)}
        title={t("journalist.smartEditor.subtitle")}
      >
        <Sparkles className="size-3.5 shrink-0 text-accent-editor" />
        <span className="font-headline text-xs font-semibold text-foreground">
          {t("journalist.smartEditor.title")}
        </span>
        {isRunning ? (
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] animate-pulse border-accent-editor/20 bg-accent-editor/10 text-accent-editor"
          >
            {t("journalist.smartEditor.loading")}
          </Badge>
        ) : null}
        {open ? (
          <ChevronUp className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {!open ? (
        <div className="smart-editor-inline-tools">
          {SMART_EDITOR_TOOLS.map((tool) => (
            <SmartEditorCompactChip
              key={tool}
              tool={tool}
              label={t(`journalist.smartEditor.tools.${tool}`)}
              isRunning={isRunning && activeTool === tool}
              disabled={isRunning}
              onSelect={handleCompactToolSelect}
              compact
            />
          ))}
        </div>
      ) : null}
    </div>
  ) : (
    <>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-start"
        onClick={() => onOpenChange(!open)}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="flex flex-wrap items-center gap-2 font-headline text-base">
            <Sparkles className="size-5 text-accent-editor" />
            {t("journalist.smartEditor.title")}
            {isRunning ? (
              <Badge
                variant="secondary"
                className="animate-pulse border-accent-editor/20 bg-accent-editor/10 text-accent-editor"
              >
                {t("journalist.smartEditor.loading")}
              </Badge>
            ) : null}
          </CardTitle>
          {!open ? (
            <p className="text-xs text-muted-foreground">
              {t("journalist.smartEditor.subtitle")}
            </p>
          ) : null}
        </div>
        {open ? (
          <ChevronUp className="mt-1 size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {!open ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground">
            {t("journalist.smartEditor.toolsAvailable")}
          </p>
          <div className="flex gap-1.5">
            {SMART_EDITOR_TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool];
              return (
                <span
                  key={tool}
                  className="inline-flex size-7 items-center justify-center rounded-md border border-accent-editor/15 bg-accent-editor/8 text-accent-editor"
                >
                  <Icon className="size-3.5" />
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );

  const expandedContent = open ? (
    <div className={cn("space-y-4", isInline ? "px-3 pb-3 pt-2" : undefined)}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SMART_EDITOR_TOOLS.map((tool) => (
          <SmartEditorToolCard
            key={tool}
            tool={tool}
            label={t(`journalist.smartEditor.tools.${tool}`)}
            description={t(`journalist.smartEditor.toolDescriptions.${tool}`)}
            isActive={selectedTool === tool}
            isRunning={isRunning && activeTool === tool}
            disabled={isRunning}
            onSelect={handleSelectTool}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-sm font-medium">
            {t("journalist.smartEditor.textLabel")}
          </label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-accent-editor hover:bg-accent-editor/8 hover:text-accent-editor"
            disabled={!articleContent.trim() || isRunning}
            onClick={handleUseArticleContent}
          >
            <FileText className="size-3.5" />
            {t("journalist.smartEditor.useArticleContent")}
          </Button>
        </div>
        <div className="smart-editor-input p-1">
          <Textarea
            value={toolText}
            onChange={(event) => setToolText(event.target.value)}
            placeholder={t("journalist.smartEditor.textPlaceholder")}
            rows={6}
            disabled={isRunning}
            className="min-h-36 resize-y border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="space-y-1.5">
          <div className="smart-editor-char-bar">
            <div
              className={cn(
                "smart-editor-char-bar-fill",
                isOverLimit && "smart-editor-char-bar-fill--over",
              )}
              style={{ width: `${charProgress}%` }}
            />
          </div>
          <p
            className={cn(
              "text-xs",
              isOverLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {t("journalist.smartEditor.charLimit", { count: charCount })}
          </p>
        </div>
      </div>

      {isRunning ? <SmartEditorLoading steps={loadingSteps} /> : null}

      <Button
        type="button"
        className="w-full bg-accent-editor hover:bg-accent-editor/90"
        disabled={!canRun}
        onClick={handleRun}
      >
        {isRunning ? <Loader className="size-4 animate-spin" /> : null}
        {selectedTool
          ? t(`journalist.smartEditor.tools.${selectedTool}`)
          : t("journalist.smartEditor.runTool")}
      </Button>

      {result ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/15 p-3">
          <div className="smart-editor-compare">
            <div className="smart-editor-compare-original space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <ArrowLeft className="size-3.5" />
                {t("journalist.smartEditor.original")}
              </div>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                {result.data.original}
              </p>
            </div>

            {isBulletPointsResult(result.data) ? (
              <div className="smart-editor-compare-result space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-editor">
                    <Sparkles className="size-3.5" />
                    {t("journalist.smartEditor.points")}
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {t("journalist.smartEditor.suggested")}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {result.data.points.map((point, index) => (
                    <div
                      key={`${point}-${index}`}
                      className="smart-editor-bullet"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="smart-editor-compare-result space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent-editor">
                    <Sparkles className="size-3.5" />
                    {t("journalist.smartEditor.result")}
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {t("journalist.smartEditor.suggested")}
                  </Badge>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground">
                  {result.data.result}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-border/60 pt-3">
            <Button type="button" size="sm" variant="success" onClick={handleApply}>
              {t("journalist.smartEditor.apply")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
            >
              {t("journalist.smartEditor.dismiss")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  if (isInline) {
    return (
      <div
        className={cn(
          "smart-editor-inline overflow-hidden rounded-md",
          open && "smart-editor-inline--open",
        )}
      >
        <div
          className={cn(
            "smart-editor-inline-bar",
            open && "smart-editor-header smart-editor-inline-header",
          )}
        >
          {headerContent}
        </div>
        {expandedContent}
      </div>
    );
  }

  return (
    <Card className="journalist-smart-editor overflow-hidden">
      <div className="h-1 bg-linear-to-r from-accent-editor-secondary to-accent-editor" />
      <CardHeader className={cn("pb-3", open && "smart-editor-header")}>
        {headerContent}
      </CardHeader>
      {expandedContent ? <CardContent>{expandedContent}</CardContent> : null}
    </Card>
  );
}
