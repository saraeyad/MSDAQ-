import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";
import type { DiscussionPost } from "@/types/discussion";
import useAdminDiscussionActions from "@/views/admin/discussion/hooks/use-admin-discussion-actions";
import { Loader, MessageSquare, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useJournalistPostFlag from "../hooks/useJournalistPostFlag";
import { formatRelativeTime } from "../utils/format-relative-time";
import PostComments from "./post-comments";

interface PostCardProps {
  post: DiscussionPost;
  highlighted?: boolean;
  animateIndex?: number;
}

export default function PostCard({
  post,
  highlighted,
  animateIndex,
}: PostCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { flag, unflag, isFlagging, isUnflagging } = useJournalistPostFlag(post.id);
  const { removePost, isRemoving } = useAdminDiscussionActions();

  const isJournalist = user?.role === "journalist";
  const isAdmin = user?.role === "admin";
  const isInvestigating = post.journalistFlag != null;

  return (
    <article
      className={cn(
        "discussion-post-card overflow-hidden rounded-lg border border-border/80 bg-card",
        highlighted && "discussion-post-card-featured",
        animateIndex != null && "articles-animate-in",
      )}
      style={
        animateIndex != null
          ? { animationDelay: `${animateIndex * 70}ms` }
          : undefined
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-9 shrink-0 ring-2 ring-background">
            <AvatarFallback className="bg-muted text-muted-foreground">
              {post.author === "Anonymous" ? (
                <User className="size-4" />
              ) : (
                post.author.slice(0, 1)
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{post.author}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {highlighted ? (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {t("discussion.filters.latest")}
            </Badge>
          ) : null}
          {isInvestigating ? (
            <Badge className="shrink-0 gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-normal">
              <Search className="size-3" />
              {t("discussion.investigatingBadge")}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="border-t border-border/60 px-5 py-5">
        <p className="whitespace-pre-wrap text-body-md leading-relaxed text-foreground">
          {post.content}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 py-3">
        <button
          type="button"
          onClick={() => setCommentsOpen((open) => !open)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-secondary"
        >
          <MessageSquare className="size-4" />
          {commentsOpen ? t("discussion.hideComments") : t("discussion.viewComments")}
        </button>

        <div className="flex items-center gap-2">
          {isJournalist ? (
            isInvestigating ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isUnflagging}
                onClick={() => unflag()}
              >
                {isUnflagging ? <Loader className="size-4 animate-spin" /> : null}
                {t("discussion.unflagPost")}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={isFlagging}
                onClick={() => flag()}
              >
                {isFlagging ? <Loader className="size-4 animate-spin" /> : null}
                {t("discussion.flagPost")}
              </Button>
            )
          ) : null}
          {isAdmin ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isRemoving}
              onClick={() => removePost(post.id)}
            >
              {isRemoving ? <Loader className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t("admin.discussion.remove")}
            </Button>
          ) : null}
        </div>
      </div>

      {commentsOpen ? <PostComments postId={post.id} /> : null}
    </article>
  );
}
