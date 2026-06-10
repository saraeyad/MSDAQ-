import { errorToast, successToast } from "@/components/sonner-toast";
import {
  discussionCommentSchema,
  type DiscussionCommentSchemaType,
} from "@/schemas/discussion-schema";
import Discussion_APIs from "@/services/api/discussion";
import {
  getDiscussionErrorMessage,
  parseDiscussionCommentResponse,
} from "@/services/types/discussion";
import type { DiscussionComment } from "@/types/discussion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

type UseComposeCommentOptions = {
  postId: number;
  parentId?: number;
  onSuccess?: () => void;
};

function appendComment(
  comments: DiscussionComment[],
  comment: DiscussionComment,
): DiscussionComment[] {
  if (comment.parentId == null) {
    return [...comments, { ...comment, replies: [] }];
  }

  return comments.map((item) => {
    if (item.id === comment.parentId) {
      return {
        ...item,
        replies: [...item.replies, comment],
      };
    }
    return item;
  });
}

function useComposeComment({
  postId,
  parentId,
  onSuccess,
}: UseComposeCommentOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<DiscussionCommentSchemaType>({
    resolver: zodResolver(discussionCommentSchema),
    defaultValues: {
      content: "",
      isAnonymous: false,
      displayName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DiscussionCommentSchemaType) => {
      const response = await Discussion_APIs.createComment(postId, {
        content: data.content,
        is_anonymous: data.isAnonymous,
        display_name: data.isAnonymous ? undefined : data.displayName,
        parent_id: parentId,
      });
      return parseDiscussionCommentResponse(response.data);
    },
    onSuccess: (comment) => {
      successToast(
        parentId ? t("discussion.replySuccess") : t("discussion.commentSuccess"),
      );
      form.reset({
        content: "",
        isAnonymous: false,
        displayName: "",
      });

      queryClient.setQueryData(
        ["discussion-comments", postId],
        (current: { comments: DiscussionComment[]; meta: { total: number } } | undefined) => {
          if (!current) return current;
          return {
            ...current,
            comments: appendComment(current.comments, comment),
            meta: {
              ...current.meta,
              total: current.meta.total + 1,
            },
          };
        },
      );

      onSuccess?.();
    },
    onError: (error) => {
      errorToast(getDiscussionErrorMessage(error, t("discussion.commentError")));
    },
  });

  const onSubmit = (data: DiscussionCommentSchemaType) => {
    mutation.mutate(data);
  };

  return { form, onSubmit, loading: mutation.isPending };
}

export default useComposeComment;
