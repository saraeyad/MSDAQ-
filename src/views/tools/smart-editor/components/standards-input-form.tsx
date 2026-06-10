import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StandardsCheckSchemaType } from "@/schemas/standards-check-schema";
import { Loader, ShieldCheck } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface StandardsInputFormProps {
  form: UseFormReturn<StandardsCheckSchemaType>;
  onSubmit: (data: StandardsCheckSchemaType) => void;
  loading: boolean;
}

export default function StandardsInputForm({
  form,
  onSubmit,
  loading,
}: StandardsInputFormProps) {
  const { t } = useTranslation();
  const contentLength = form.watch("content")?.length ?? 0;

  return (
    <div className="relative rounded-xl border border-border/70 bg-card p-5 shadow-sm md:p-6">
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/55 backdrop-blur-[2px]">
          <p className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {t("smartEditor.checking")}
          </p>
        </div>
      ) : null}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormTextarea
            name="content"
            label={t("smartEditor.inputLabel")}
            placeholder={t("smartEditor.placeholder")}
            required
            columnView
            rows={14}
            textareaClassName={cn(
              "min-h-[300px] resize-y rounded-lg border-border/80 bg-background/50 transition-colors focus:bg-background md:min-h-[340px]",
            )}
          />
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("smartEditor.inputHint")} ·{" "}
              <span className="font-medium tabular-nums">{contentLength}</span>
            </p>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {loading ? t("smartEditor.checking") : t("smartEditor.checkButton")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
