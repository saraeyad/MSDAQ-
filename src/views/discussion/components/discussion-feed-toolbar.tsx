import { useTranslation } from "react-i18next";

interface DiscussionFeedToolbarProps {
  postCount: number;
}

export default function DiscussionFeedToolbar({ postCount }: DiscussionFeedToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <p className="text-body-md font-semibold text-secondary">
        {t("discussion.filters.latest")}
      </p>
      <p className="text-body-md text-muted-foreground">
        {t("discussion.postCount", { count: postCount })}
      </p>
    </div>
  );
}
