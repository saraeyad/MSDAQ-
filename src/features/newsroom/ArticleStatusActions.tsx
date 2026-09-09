import { Button } from "@/components/ui/button";
import { staffArticleEditPath } from "@/router/routes";
import type { StaffArticle } from "@/types";
import { CalendarClock, PenLine, Send, Undo2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ArticleStatusActionsProps {
  article: StaffArticle;
  canEdit: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canRevert: boolean;
  onRevert: (article: StaffArticle) => void;
}

export function ArticleStatusActions({
  article,
  canEdit,
  canPublish,
  canSchedule,
  canRevert,
  onRevert,
}: ArticleStatusActionsProps) {
  const updatePath = staffArticleEditPath(article.id, 1);
  const lastStepPath = staffArticleEditPath(article.id, 7);
  const isDraft = article.status === "draft" || article.status === "reverted";
  const isPublished = article.status === "published";
  const isScheduled = article.status === "scheduled";

  return (
    <>
      {canEdit ? (
        <Button asChild variant="outline" size="sm">
          <Link to={updatePath}>
            <PenLine className="size-3.5" />
            تحديث
          </Link>
        </Button>
      ) : null}

      {isDraft && canPublish ? (
        <Button asChild size="sm">
          <Link to={lastStepPath}>
            <Send className="size-3.5" />
            نشر
          </Link>
        </Button>
      ) : null}

      {isDraft && canSchedule ? (
        <Button asChild variant="outline" size="sm">
          <Link to={lastStepPath}>
            <CalendarClock className="size-3.5" />
            جدولة
          </Link>
        </Button>
      ) : null}

      {(isPublished || isScheduled) && canRevert ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRevert(article)}
        >
          <Undo2 className="size-3.5" />
          إرجاع إلى مسودة
        </Button>
      ) : null}
    </>
  );
}
