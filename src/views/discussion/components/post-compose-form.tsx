import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { Loader, PenLine } from "lucide-react";
import { Controller, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useComposePost from "../hooks/useComposePost";

export default function PostComposeForm() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { form, onSubmit, loading } = useComposePost();
  const isAnonymous = form.watch("isAnonymous");

  return (
    <div className="discussion-sidebar-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-md border border-secondary/30 bg-secondary/10 text-secondary">
          <PenLine className="size-4" />
        </div>
        <h2 className="text-headline-sm">{t("discussion.composeTitle")}</h2>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormTextarea
            name="content"
            label={t("discussion.postBody")}
            placeholder={t("discussion.postPlaceholder")}
            required
            columnView
            rows={4}
          />

          {!token && !isAnonymous ? (
            <FormInput
              name="displayName"
              label={t("discussion.displayName")}
              placeholder={t("discussion.displayNamePlaceholder")}
              columnView
            />
          ) : null}

          <Controller
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="anonymous-post"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label htmlFor="anonymous-post" className="text-sm font-normal">
                  {t("discussion.anonymousToggle")}
                </Label>
              </div>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader className="size-4 animate-spin" /> : null}
            {t("discussion.publishPost")}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
