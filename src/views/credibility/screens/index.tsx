import BrandMeem from "@/components/brand-meem";
import BrandWatermark from "@/components/brand-watermark";
import CredibilityHero from "../components/credibility-hero";
import CredibilityInputForm from "../components/credibility-input-form";
import CredibilityResultsModal from "../components/credibility-results-modal";
import VerdictLegend from "../components/verdict-legend";
import useCredibilityCheck from "../hooks/useCredibilityCheck";

export default function CredibilityChecker() {
  const { form, onSubmit, loading, result, checkedAt, handleModalOpenChange } =
    useCredibilityCheck();

  return (
    <div className="credibility-page">
      <section className="relative overflow-hidden">
        <BrandWatermark size="lg" className="absolute -bottom-6 end-8" />
        <BrandMeem className="absolute -start-2 top-4 text-[8rem] md:text-[10rem]" />

        <div className="container-page relative py-6 pb-12 md:py-8 md:pb-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-7 rtl:lg:flex-row-reverse xl:gap-8">
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-52 xl:w-56">
              <VerdictLegend variant="sidebar" />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <CredibilityHero />
              <CredibilityInputForm
                form={form}
                onSubmit={onSubmit}
                loading={loading}
                variant="embedded"
              />
            </div>
          </div>
        </div>
      </section>

      <CredibilityResultsModal
        open={loading || result !== null}
        onOpenChange={handleModalOpenChange}
        loading={loading}
        result={result}
        checkedAt={checkedAt}
      />
    </div>
  );
}
