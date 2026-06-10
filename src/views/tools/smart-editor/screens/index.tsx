import BrandMeem from "@/components/brand-meem";
import BrandWatermark from "@/components/brand-watermark";
import JournalistCtaCard from "../components/journalist-cta-card";
import SmartEditorHero from "../components/smart-editor-hero";
import StandardsCriteriaLegend from "../components/standards-criteria-legend";
import StandardsInputForm from "../components/standards-input-form";
import StandardsResultsModal from "../components/standards-results-modal";
import useStandardsCheck from "../hooks/useStandardsCheck";

export default function SmartEditorPublic() {
  const { form, onSubmit, loading, result, checkedAt, handleModalOpenChange } =
    useStandardsCheck();

  return (
    <div className="smart-editor-page">
      <section className="relative overflow-hidden">
        <BrandWatermark size="lg" className="absolute -bottom-6 end-8" />
        <BrandMeem className="absolute -start-2 top-4 text-[8rem] md:text-[10rem]" />

        <div className="container-page relative py-6 pb-12 md:py-8 md:pb-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-7 rtl:lg:flex-row-reverse xl:gap-8">
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-52 xl:w-56">
              <StandardsCriteriaLegend />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <SmartEditorHero />
              <StandardsInputForm form={form} onSubmit={onSubmit} loading={loading} />
              <JournalistCtaCard />
            </div>
          </div>
        </div>
      </section>

      <StandardsResultsModal
        open={loading || result !== null}
        onOpenChange={handleModalOpenChange}
        loading={loading}
        result={result}
        checkedAt={checkedAt}
      />
    </div>
  );
}
