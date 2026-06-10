import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CredibilityCheckSchemaType } from "@/schemas/credibility-schema";
import { Loader, ShieldCheck } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface CredibilityInputFormProps {
  form: UseFormReturn<CredibilityCheckSchemaType>;
  onSubmit: (data: CredibilityCheckSchemaType) => void;
  loading: boolean;
  variant?: "embedded" | "standalone";
  fullWidth?: boolean;
}

export default function CredibilityInputForm({
  form,
  onSubmit,
  loading,
  variant = "standalone",
  fullWidth = false,
}: CredibilityInputFormProps) {
  const { t } = useTranslation();
  const contentLength = form.watch("content")?.length ?? 0;
  const isEmbedded = variant === "embedded";
  const isWide = fullWidth || isEmbedded;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/70 bg-card shadow-sm",
        isEmbedded ? "p-5 md:p-6" : "p-6 md:p-8",
      )}
    >
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[2px]">
          <p className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {t("credibility.checking")}
          </p>
        </div>
      ) : null}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormTextarea
            name="content"
            label={t("credibility.inputLabel")}
            placeholder={t("credibility.placeholder")}
            required
            columnView
            rows={isWide ? 14 : 10}
            textareaClassName={cn(
              "resize-y rounded-lg border-border/80 bg-background/50 transition-colors focus:bg-background",
              isWide ? "min-h-[300px] md:min-h-[340px]" : "min-h-[360px]",
            )}
          />
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("credibility.inputHint")} ·{" "}
              <span className="font-medium tabular-nums">{contentLength}</span>
            </p>
            <Button
              type="submit"
              size={isEmbedded ? "default" : "lg"}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {loading ? t("credibility.checking") : t("credibility.checkButton")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
