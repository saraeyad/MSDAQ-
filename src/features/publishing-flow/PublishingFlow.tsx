import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { PublishingStepper } from "@/features/publishing-flow/PublishingStepper";
import { Step1Details } from "@/features/publishing-flow/steps/Step1Details";
import { Step2Cover } from "@/features/publishing-flow/steps/Step2Cover";
import { Step3Body } from "@/features/publishing-flow/steps/Step3Body";
import { Step4Standards } from "@/features/publishing-flow/steps/Step4Standards";
import { Step5Credibility } from "@/features/publishing-flow/steps/Step5Credibility";
import { Step6Localize } from "@/features/publishing-flow/steps/Step6Localize";
import { Step7Publish } from "@/features/publishing-flow/steps/Step7Publish";
import { useStaffArticleMedia } from "@/hooks/publishing";
import { mergeArticleMedia } from "@/lib/media";
import {
  clampArticleStep,
  getNextStep,
  getPreviousStep,
  inferArticleStep,
  isStepVisible,
  stepsForMediaType,
} from "@/lib/publishing";
import { staffArticleEditPath } from "@/router/routes";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PenLine } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function PublishingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));

  const { data: article, isLoading } = useQuery({
    queryKey: ["staff-article", id],
    queryFn: () => ArticlesStaff_APIs.getArticle(id!),
    enabled: !isNew,
  });
  const { data: articleMedia } = useStaffArticleMedia(id, !isNew);
  const articleView = article
    ? mergeArticleMedia(article, articleMedia)
    : article;

  const mediaType = articleView?.media_type ?? "text";
  const inferredStep = articleView ? inferArticleStep(articleView) : 1;
  const currentStep = isNew
    ? 1
    : articleView
      ? clampArticleStep(step || inferredStep, articleView)
      : 1;

  useEffect(() => {
    if (isNew || !articleView || !step) return;

    if (!isStepVisible(step, mediaType)) {
      const fallback = stepsForMediaType(mediaType)[0]?.num ?? 1;
      void setStep(fallback);
    }
  }, [articleView, isNew, mediaType, setStep, step]);

  const goToStep = (next: number) => {
    if (!articleView) {
      void setStep(next);
      return;
    }
    void setStep(clampArticleStep(next, articleView));
  };

  const advanceStep = async () => {
    const next = getNextStep(currentStep, mediaType);
    if (id) {
      await queryClient.refetchQueries({ queryKey: ["staff-article", id] });
      await queryClient.invalidateQueries({
        queryKey: ["staff", "article-media", String(id)],
      });
    }
    void setStep(next);
  };

  const goBackStep = () => {
    void setStep(getPreviousStep(currentStep, mediaType));
  };

  const handleCreated = (articleId: number | string) => {
    navigate(staffArticleEditPath(articleId, 2), { replace: true });
  };

  if (!isNew && isLoading) {
    return (
      <div className="publish-flow-page">
        <div className="publish-flow-loader publish-flow-loader--page" role="status">
          <span className="publish-flow-loader__ring" aria-hidden>
            <Loader2 className="size-5 animate-spin" />
          </span>
          <div className="publish-flow-loader__copy">
            <p className="publish-flow-loader__title">جاري تجهيز المقال</p>
            <p className="publish-flow-loader__hint">لحظة واحدة ريثما تُحمَّل بيانات المسار</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="publish-flow-page">
      <header className="publish-flow-hero publish-flow-hero--compact">
        <span className="publish-flow-hero__badge">
          <PenLine className="size-3.5" />
          مسار النشر
        </span>
        <h2 className="section-title">
          {isNew
            ? "مقال جديد"
            : articleView?.status === "published"
              ? "تحديث مقال منشور"
              : articleView?.status === "scheduled"
                ? "تحديث مقال مجدول"
                : "تعديل المقال"}
        </h2>
      </header>

      {!isNew && articleView && (
        <SourceConsentBanner sources={articleView.sources ?? []} />
      )}

      {!isNew && articleView && (
        <PublishingStepper
          currentStep={currentStep}
          article={articleView}
          mediaType={mediaType}
          onStepClick={(s) => goToStep(s)}
        />
      )}

      <div className="publish-flow-panel">
        {isNew && <Step1Details onCreated={handleCreated} />}

        {!isNew && articleView && currentStep === 1 && (
          <Step1Details article={articleView} onComplete={() => goToStep(2)} />
        )}

        {!isNew && articleView && currentStep === 2 && (
          <Step2Cover
            article={articleView}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && articleView && currentStep === 3 && mediaType === "text" && (
          <Step3Body
            articleId={articleView.id}
            initialBody={articleView.content?.formal}
            images={articleView.images ?? []}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && articleView && currentStep === 4 && mediaType === "text" && (
          <Step4Standards
            articleId={articleView.id}
            title={articleView.title}
            contentFormal={articleView.content?.formal}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && articleView && currentStep === 5 && mediaType === "text" && (
          <Step5Credibility
            sources={articleView.sources ?? []}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && articleView && currentStep === 6 && mediaType === "text" && (
          <Step6Localize
            articleId={articleView.id}
            bodyFormal={articleView.content?.formal}
            bodySimplified={articleView.content?.simplified}
            bodyDialect={articleView.content?.dialect}
            generatedAudio={articleView.generated_audio}
            onComplete={advanceStep}
            onSkip={() => goToStep(7)}
            onBack={goBackStep}
          />
        )}

        {!isNew && articleView && currentStep === 7 && (
          <Step7Publish articleId={articleView.id} onBack={goBackStep} />
        )}
      </div>
    </div>
  );
}
