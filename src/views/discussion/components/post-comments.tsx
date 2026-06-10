import { Button } from "@/components/ui/button";
import type { DiscussionComment } from "@/types/discussion";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import usePostComments from "../hooks/usePostComments";
import { formatRelativeTime } from "../utils/format-relative-time";
import CommentForm from "./comment-form";

interface PostCommentsProps {
  postId: number;
}

function CommentItem({
  comment,
  postId,
  depth = 0,
}: {
  comment: DiscussionComment;
  postId: number;
  depth?: number;
}) {
  const { t } = useTranslation();
  const [replyOpen, setReplyOpen] = useState(false);

  return (
    <div className={depth > 0 ? "ms-6 border-s border-border ps-4" : undefined}>
      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{comment.author}</p>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </p>
        </div>
        <p className="mt-2 text-body-md leading-relaxed text-foreground">
          {comment.content}
        </p>
        {depth === 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 h-8 px-0 text-secondary hover:bg-transparent"
            onClick={() => setReplyOpen((open) => !open)}
          >
            {replyOpen ? t("discussion.cancelReply") : t("discussion.reply")}
          </Button>
        ) : null}
      </div>

      {replyOpen ? (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            compact
            onSuccess={() => setReplyOpen(false)}
          />
        </div>
      ) : null}

      {comment.replies.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PostComments({ postId }: PostCommentsProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePostComments(postId, true);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-4 text-sm text-muted-foreground">{t("discussion.commentsError")}</p>
    );
  }

  const comments = data?.comments ?? [];

  return (
    <div className="space-y-4 border-t border-border/60 bg-muted/10 px-5 py-5">
      <h4 className="text-sm font-semibold text-foreground">
        {t("discussion.commentsTitle")}
      </h4>

      <CommentForm postId={postId} compact />

      {comments.length ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("discussion.noComments")}</p>
      )}
    </div>
  );
}
