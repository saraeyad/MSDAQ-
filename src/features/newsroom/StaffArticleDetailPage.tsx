import { PodcastAudioPlayer } from "@/components/podcast-audio-player";
import { StatusBadge } from "@/features/admin/components/StatusBadge";
import { PublishGatePanel } from "@/features/publishing-flow/components/PublishGatePanel";
import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ArticleTrustIndexSection } from "@/features/trust-index/ArticleTrustIndexSection";
import { RescheduleArticleDialog } from "@/features/newsroom/RescheduleArticleDialog";
import { usePermission } from "@/hooks/usePermission";
import { getApiErrorMessage } from "@/lib/api-data";
import { mediaTypeLabel } from "@/lib/media-labels";
import { resolveMediaUrl } from "@/lib/media-url";
import { derivePublishGate, inferArticleStep } from "@/lib/publish-gate";
import { cn } from "@/lib/utils";
import {
  ARTICLE_TRUST_FEEDBACK_HASH,
  PERMISSIONS,
  ROUTES,
} from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  PenLine,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

function ContentPreview({
  label,
  text,
}: {
  label: string;
  text: string | null | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text?.trim()) return null;

  const preview = expanded ? text : text.slice(0, 400);
  const truncated = text.length > 400;

  return (
    <article className="staff-article-content-block">
      <h4 className="staff-article-content-block__label">{label}</h4>
      <p className="staff-article-content-block__text">
        {preview}
        {!expanded && truncated ? "…" : ""}
      </p>
      {truncated && (
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0 text-primary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "عرض أقل" : "عرض المزيد"}
        </Button>
      )}
    </article>
  );
}

function SectionPanel({
  icon: Icon,
  title,
  children,
  id,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn("staff-article-section", className)}>
      <header className="staff-article-section__header">
        <span className="staff-article-section__icon" aria-hidden>
          <Icon className="size-4" />
        </span>
        <h3 className="staff-article-section__title">{title}</h3>
      </header>
      <div className="staff-article-section__body">{children}</div>
    </section>
  );
}

export default function StaffArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canEdit = usePermission(PERMISSIONS.EDIT_ARTICLES);
  const canDelete = usePermission(PERMISSIONS.DELETE_ARTICLES);
  const canReschedule = usePermission(PERMISSIONS.SCHEDULE_ARTICLES);
  const canViewTrustIndex = usePermission(PERMISSIONS.VIEW_TRUST_INDEX);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const { data: article, isLoading, isError, error } = useQuery({
    queryKey: ["staff-article", id],
    queryFn: () => ArticlesStaff_APIs.getArticle(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => ArticlesStaff_APIs.deleteArticle(id!),
    onSuccess: () => {
      toast.success("تم حذف المقال");
      void queryClient.invalidateQueries({ queryKey: ["staff-articles"] });
      navigate(ROUTES.NEWSROOM_ARTICLES);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  useEffect(() => {
    if (!article || !canViewTrustIndex) return;
    if (window.location.hash !== `#${ARTICLE_TRUST_FEEDBACK_HASH}`) return;

    const timer = window.setTimeout(() => {
      document.getElementById(ARTICLE_TRUST_FEEDBACK_HASH)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [article?.id, canViewTrustIndex]);

  const handleDelete = () => {
    setConfirmDelete(true);
  };

  if (isLoading) {
    return (
      <div className="staff-article-page">
        <div className="staff-article-loading">
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
          <p>جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="staff-article-page">
        <Link to={ROUTES.NEWSROOM_ARTICLES} className="staff-article-back">
          <ArrowLeft className="size-4" aria-hidden />
          العودة للمقالات
        </Link>
        <div className="staff-article-error">
          <p>{isError ? getApiErrorMessage(error) : "المقال غير موجود"}</p>
        </div>
      </div>
    );
  }

  const gate = derivePublishGate(article);
  const editStep = inferArticleStep(article);
  const coverUrl = resolveMediaUrl(article.cover_image);
  const videoUrl = resolveMediaUrl(article.video);
  const sourceAudioUrl = resolveMediaUrl(article.source_audio);
  const generatedAudioUrl = resolveMediaUrl(article.generated_audio);
  const hasMedia =
    coverUrl ||
    article.media_url ||
    videoUrl ||
    sourceAudioUrl ||
    generatedAudioUrl ||
    article.video_status;
  const hasContent =
    article.content.formal?.trim() ||
    article.content.simplified?.trim() ||
    article.content.dialect?.trim();

  return (
    <div className="staff-article-page">
      <Link to={ROUTES.NEWSROOM_ARTICLES} className="staff-article-back">
        <ArrowLeft className="size-4" aria-hidden />
        العودة للمقالات
      </Link>

      <header className="staff-article-hero">
        <div className="staff-article-hero__main">
          <div className="staff-article-hero__badges">
            <StatusBadge status={article.status} />
            <span className="staff-article-chip">
              {mediaTypeLabel(article.media_type)}
            </span>
            {article.category?.name_ar && (
              <span className="staff-article-chip staff-article-chip--muted">
                {article.category.name_ar}
              </span>
            )}
          </div>

          <h1 className="staff-article-hero__title">{article.title}</h1>

          <div className="staff-article-hero__meta">
            <span className="staff-article-meta-item">
              <User className="size-3.5" aria-hidden />
              {article.author.name}
            </span>
            <span className="staff-article-meta-item">
              <CalendarClock className="size-3.5" aria-hidden />
              {new Date(article.updated_at).toLocaleString("ar")}
            </span>
          </div>

          {(article.scheduled_for || article.published_at) && (
            <div className="staff-article-hero__dates">
              {article.scheduled_for && (
                <span className="staff-article-date staff-article-date--scheduled">
                  مجدول: {new Date(article.scheduled_for).toLocaleString("ar")}
                </span>
              )}
              {article.published_at && (
                <span className="staff-article-date staff-article-date--published">
                  نُشر: {new Date(article.published_at).toLocaleString("ar")}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="staff-article-hero__actions">
          {canReschedule && article.status === "scheduled" && (
            <Button variant="outline" onClick={() => setRescheduleOpen(true)}>
              <CalendarClock className="size-4" />
              إعادة جدولة
            </Button>
          )}
          {canEdit && (
            <Button asChild>
              <Link
                to={`/newsroom/articles/${article.id}/edit?step=${editStep}`}
              >
                <PenLine className="size-4" />
                تحرير في مسار النشر
              </Link>
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              حذف
            </Button>
          )}
        </div>
      </header>

      {article.description && (
        <div className="staff-article-lead">
          <p>{article.description}</p>
        </div>
      )}

      <SourceConsentBanner sources={article.sources} />

      {hasMedia && (
        <SectionPanel icon={ImageIcon} title="الوسائط">
          {coverUrl && (
            <div className="staff-article-cover">
              <img src={coverUrl} alt="" className="staff-article-cover__img" />
            </div>
          )}

          {article.media_url && (
            <a
              href={article.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="staff-article-embed-link"
              dir="ltr"
            >
              <ExternalLink className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{article.media_url}</span>
            </a>
          )}

          {article.video_status && (
            <p className="staff-article-media-note">
              حالة الفيديو: {article.video_status}
            </p>
          )}

          {videoUrl && (
            <video
              controls
              className="staff-article-video"
              src={videoUrl}
            />
          )}

          {sourceAudioUrl && (
            <div className="staff-article-audio">
              <p className="staff-article-audio__label">الصوت المصدر</p>
              <PodcastAudioPlayer
                seed={`article-${article.id}-source`}
                url={sourceAudioUrl}
                coverUrl={coverUrl ?? undefined}
                title={article.title}
                subtitle="صوت المصدر"
              />
            </div>
          )}

          {generatedAudioUrl && (
            <div className="staff-article-audio">
              <p className="staff-article-audio__label">الصوت المُولَّد</p>
              <PodcastAudioPlayer
                seed={`article-${article.id}-generated`}
                url={generatedAudioUrl}
                coverUrl={coverUrl ?? undefined}
                title={article.title}
                subtitle="صوت مُولَّد"
              />
            </div>
          )}
        </SectionPanel>
      )}

      {hasContent && (
        <SectionPanel icon={FileText} title="المحتوى">
          <ContentPreview label="الفصحى" text={article.content.formal} />
          <ContentPreview label="مبسّطة" text={article.content.simplified} />
          <ContentPreview label="عامية" text={article.content.dialect} />
        </SectionPanel>
      )}

      {article.sources.length > 0 && (
        <SectionPanel icon={ExternalLink} title={`المصادر (${article.sources.length})`}>
          <ul className="staff-article-sources">
            {article.sources.map((source) => (
              <li key={source.id} className="staff-article-source">
                <p className="staff-article-source__name">{source.source}</p>
                <p className="staff-article-source__type">{source.source_type}</p>
                {source.consent_status && (
                  <p className="staff-article-source__consent">
                    الموافقة: {source.consent_status}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </SectionPanel>
      )}

      {canViewTrustIndex && (
        <SectionPanel
          id={ARTICLE_TRUST_FEEDBACK_HASH}
          icon={BarChart3}
          title="مؤشر ثقة الجمهور"
          className="staff-article-section--trust"
        >
          <ArticleTrustIndexSection articleId={article.id} />
        </SectionPanel>
      )}

      <div className="staff-article-gate">
        <PublishGatePanel gate={gate} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        description={`هل تريد حذف «${article.title}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        isPending={deleteMutation.isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />

      <RescheduleArticleDialog
        article={rescheduleOpen ? article : null}
        onClose={() => setRescheduleOpen(false)}
      />
    </div>
  );
}
