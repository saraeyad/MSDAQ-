import FormInput from "@/components/form/form-input";
import FormTextarea from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { Loader } from "lucide-react";
import { Controller, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import useComposeComment from "../hooks/useComposeComment";

interface CommentFormProps {
  postId: number;
  parentId?: number;
  compact?: boolean;
  onSuccess?: () => void;
}

export default function CommentForm({
  postId,
  parentId,
  compact = false,
  onSuccess,
}: CommentFormProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { form, onSubmit, loading } = useComposeComment({
    postId,
    parentId,
    onSuccess,
  });

  const isAnonymous = form.watch("isAnonymous");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormTextarea
          name="content"
          label={compact ? undefined : t("discussion.commentBody")}
          placeholder={t("discussion.commentPlaceholder")}
          required
          columnView
          rows={compact ? 3 : 4}
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
                id={`anonymous-comment-${postId}-${parentId ?? "root"}`}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label
                htmlFor={`anonymous-comment-${postId}-${parentId ?? "root"}`}
                className="text-body-md font-normal"
              >
                {t("discussion.anonymousToggle")}
              </Label>
            </div>
          )}
        />

        <Button type="submit" size={compact ? "sm" : "default"} disabled={loading}>
          {loading ? <Loader className="size-4 animate-spin" /> : null}
          {parentId ? t("discussion.publishReply") : t("discussion.publishComment")}
        </Button>
      </form>
    </FormProvider>
  );
}
