import { PageLoading } from "@/components/loading-spinner";
import { SourceConsentBanner } from "@/features/publishing-flow/components/SourceConsentBanner";
import { PublishingStepper } from "@/features/publishing-flow/PublishingStepper";
import { Step1Details } from "@/features/publishing-flow/steps/Step1Details";
import { Step2Cover } from "@/features/publishing-flow/steps/Step2Cover";
import { Step3Body } from "@/features/publishing-flow/steps/Step3Body";
import { Step4Standards } from "@/features/publishing-flow/steps/Step4Standards";
import { Step5Credibility } from "@/features/publishing-flow/steps/Step5Credibility";
import { Step6Localize } from "@/features/publishing-flow/steps/Step6Localize";
import { Step7Publish } from "@/features/publishing-flow/steps/Step7Publish";
import {
  clampArticleStep,
  getNextStep,
  getPreviousStep,
  inferArticleStep,
  isStepVisible,
  stepsForMediaType,
} from "@/lib/publish-gate";
import { ArticlesStaff_APIs } from "@/services/api/articles-staff";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
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

  const mediaType = article?.media_type ?? "text";
  const inferredStep = article ? inferArticleStep(article) : 1;
  const currentStep = isNew
    ? 1
    : article
      ? clampArticleStep(step || inferredStep, article)
      : 1;

  useEffect(() => {
    if (isNew || !article || !step) return;

    if (!isStepVisible(step, mediaType)) {
      const fallback = stepsForMediaType(mediaType)[0]?.num ?? 1;
      void setStep(fallback);
    }
  }, [article, isNew, mediaType, setStep, step]);

  const goToStep = (next: number) => {
    if (!article) {
      void setStep(next);
      return;
    }
    void setStep(clampArticleStep(next, article));
  };

  const advanceStep = async () => {
    const next = getNextStep(currentStep, mediaType);
    if (id) {
      await queryClient.refetchQueries({ queryKey: ["staff-article", id] });
    }
    void setStep(next);
  };

  const goBackStep = () => {
    void setStep(getPreviousStep(currentStep, mediaType));
  };

  const handleCreated = (articleId: number) => {
    navigate(`/newsroom/articles/${articleId}/edit?step=2`, { replace: true });
  };

  if (!isNew && isLoading) {
    return (
      <div className="publish-flow-page">
        <PageLoading />
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
        <h2 className="section-title">مقال جديد</h2>
      </header>

      {!isNew && article && (
        <SourceConsentBanner sources={article.sources ?? []} />
      )}

      {!isNew && article && (
        <PublishingStepper
          currentStep={currentStep}
          article={article}
          mediaType={mediaType}
          onStepClick={(s) => goToStep(s)}
        />
      )}

      <div className="publish-flow-panel">
        {isNew && <Step1Details onCreated={handleCreated} />}

        {!isNew && article && currentStep === 1 && (
          <Step1Details article={article} onComplete={() => goToStep(2)} />
        )}

        {!isNew && article && currentStep === 2 && (
          <Step2Cover
            article={article}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && article && currentStep === 3 && mediaType === "text" && (
          <Step3Body
            articleId={article.id}
            initialBody={article.content?.formal}
            images={article.images ?? []}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && article && currentStep === 4 && mediaType === "text" && (
          <Step4Standards
            articleId={article.id}
            title={article.title}
            contentFormal={article.content?.formal}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && article && currentStep === 5 && mediaType === "text" && (
          <Step5Credibility
            articleId={article.id}
            sources={article.sources ?? []}
            onComplete={advanceStep}
            onBack={goBackStep}
          />
        )}

        {!isNew && article && currentStep === 6 && mediaType === "text" && (
          <Step6Localize
            articleId={article.id}
            bodyFormal={article.content?.formal}
            bodySimplified={article.content?.simplified}
            bodyDialect={article.content?.dialect}
            generatedAudio={article.generated_audio}
            onComplete={advanceStep}
            onSkip={() => goToStep(7)}
            onBack={goBackStep}
          />
        )}

        {!isNew && article && currentStep === 7 && (
          <Step7Publish articleId={article.id} onBack={goBackStep} />
        )}
      </div>
    </div>
  );
}
