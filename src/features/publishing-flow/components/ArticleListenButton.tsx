import { Button } from "@/components/ui/button";
import { PublicArticleAudioPlayer } from "@/features/public-site/components/PublicArticleAudioPlayer";
import type { ArticleMediaScope } from "@/hooks/useLazyArticleMedia";
import { cn } from "@/lib/utils";
import { Headphones } from "lucide-react";

export function ArticleListenButton({
  pressed,
  onClick,
  className,
}: {
  pressed: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-8 w-fit shrink-0 rounded-full bg-background px-3",
        className,
      )}
      aria-pressed={pressed}
      onClick={onClick}
    >
      <Headphones className="size-3.5" />
      استمع
    </Button>
  );
}

export function ArticleListenPlayer({
  articleId,
  scope = "staff",
}: {
  articleId: number | string;
  scope?: ArticleMediaScope;
}) {
  return (
    <PublicArticleAudioPlayer
      articleId={articleId}
      scope={scope}
      variant="inline"
      preferNarration
      loadOnMount
      startOnMount
    />
  );
}
