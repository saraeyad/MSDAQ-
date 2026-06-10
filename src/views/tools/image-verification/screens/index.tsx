import BrandMeem from "@/components/brand-meem";
import BrandWatermark from "@/components/brand-watermark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AiDetectionLegend from "../components/ai-detection-legend";
import AiDetectionResultsModal from "../components/ai-detection-results-modal";
import AmbientGhosts from "../components/ambient-ghosts";
import ImageFileInputForm from "../components/image-file-input-form";
import ImageTraceLegend from "../components/image-trace-legend";
import ImageUrlInputForm from "../components/image-url-input-form";
import ImageVerificationHero from "../components/image-verification-hero";
import ImageVerificationResultsModal from "../components/image-verification-results-modal";
import useImageVerification from "../hooks/useImageVerification";
import { useTranslation } from "react-i18next";

export default function ImageVerificationPublic() {
  const { t } = useTranslation();
  const {
    mode,
    setMode,
    reverseForm,
    onReverseSubmit,
    reverseLoading,
    reverseResult,
    reversePreviewUrl,
    setReversePreviewUrl,
    handleReverseModalOpenChange,
    aiForm,
    onAiSubmit,
    aiLoading,
    aiResult,
    aiPreviewUrl,
    setAiFilePreview,
    handleAiModalOpenChange,
  } = useImageVerification();

  return (
    <div className="image-verification-page">
      <AmbientGhosts />
      <section className="relative overflow-hidden">
        <BrandWatermark size="lg" className="absolute -bottom-6 end-8" />
        <BrandMeem className="absolute -start-2 top-4 text-[8rem] md:text-[10rem]" />

        <div className="container-page relative py-6 pb-12 md:py-8 md:pb-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-7 rtl:lg:flex-row-reverse xl:gap-8">
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-52 xl:w-56">
              {mode === "reverse" ? <ImageTraceLegend /> : <AiDetectionLegend />}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <ImageVerificationHero mode={mode} />

              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value as typeof mode)}
              >
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="reverse">{t("imageVerification.tabs.reverse")}</TabsTrigger>
                  <TabsTrigger value="ai">{t("imageVerification.tabs.ai")}</TabsTrigger>
                </TabsList>

                <TabsContent value="reverse" className="mt-4">
                  <ImageUrlInputForm
                    form={reverseForm}
                    onSubmit={onReverseSubmit}
                    loading={reverseLoading}
                    previewUrl={reversePreviewUrl}
                    onPreviewUrlChange={setReversePreviewUrl}
                  />
                </TabsContent>

                <TabsContent value="ai" className="mt-4">
                  <ImageFileInputForm
                    form={aiForm}
                    onSubmit={onAiSubmit}
                    loading={aiLoading}
                    previewUrl={aiPreviewUrl}
                    onFileChange={setAiFilePreview}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <ImageVerificationResultsModal
        open={reverseLoading || reverseResult !== null}
        onOpenChange={handleReverseModalOpenChange}
        loading={reverseLoading}
        result={reverseResult}
        previewUrl={reversePreviewUrl}
      />

      <AiDetectionResultsModal
        open={aiLoading || aiResult !== null}
        onOpenChange={handleAiModalOpenChange}
        loading={aiLoading}
        result={aiResult}
        previewUrl={aiPreviewUrl}
      />
    </div>
  );
}
