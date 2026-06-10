import { errorToast, successToast } from "@/components/sonner-toast";
import {
  discussionPostSchema,
  type DiscussionPostSchemaType,
} from "@/schemas/discussion-schema";
import Discussion_APIs from "@/services/api/discussion";
import {
  getDiscussionErrorMessage,
  parseDiscussionPostResponse,
} from "@/services/types/discussion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function useComposePost() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<DiscussionPostSchemaType>({
    resolver: zodResolver(discussionPostSchema),
    defaultValues: {
      content: "",
      isAnonymous: false,
      displayName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DiscussionPostSchemaType) => {
      const response = await Discussion_APIs.create({
        content: data.content,
        is_anonymous: data.isAnonymous,
        display_name: data.isAnonymous ? undefined : data.displayName,
      });
      return parseDiscussionPostResponse(response.data);
    },
    onSuccess: (post) => {
      successToast(t("discussion.postSuccess"));
      form.reset({
        content: "",
        isAnonymous: false,
        displayName: "",
      });

      queryClient.setQueriesData(
        { queryKey: ["discussion-posts"] },
        (current: { posts: typeof post[]; meta: { total: number } } | undefined) => {
          if (!current) return current;
          return {
            ...current,
            posts: [post, ...current.posts.filter((item) => item.id !== post.id)],
            meta: {
              ...current.meta,
              total: current.meta.total + 1,
            },
          };
        },
      );
    },
    onError: (error) => {
      errorToast(getDiscussionErrorMessage(error, t("discussion.postError")));
    },
  });

  const onSubmit = (data: DiscussionPostSchemaType) => {
    mutation.mutate(data);
  };

  return { form, onSubmit, loading: mutation.isPending };
}

export default useComposePost;
