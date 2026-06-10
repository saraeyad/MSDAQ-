import BrandMeem from "@/components/brand-meem";
import BrandWatermark from "@/components/brand-watermark";
import { PUBLIC_TOOLS } from "@/lib/tool-config";
import { useAuth } from "@/context/auth";
import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
import ShowcaseHeadline from "./showcase-headline";
import ShowcaseToolCard from "./showcase-tool-card";
import ShowcaseWorkflowStrip from "./showcase-workflow-strip";

export default function HomeToolsShowcase() {
  const { user } = useAuth();
  const isJournalist = user?.role === "journalist";
  const [activeStep, setActiveStep] = useState(1);

  const handleStepChange = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  return (
    <section className="home-tools-showcase relative min-h-[90vh] border-b border-border/80">
      <div className="home-showcase-orb home-showcase-orb-blue" aria-hidden />
      <div className="home-showcase-orb home-showcase-orb-violet" aria-hidden />
      <div className="home-showcase-orb home-showcase-orb-amber" aria-hidden />

      <BrandWatermark size="xl" className="absolute -bottom-8 end-0 opacity-[0.15] md:end-16" />
      <BrandMeem className="absolute -start-4 top-1/3 opacity-[0.08] text-[10rem] md:text-[14rem]" />

      <div className="container-page relative z-[2] flex min-h-[90vh] flex-col justify-center py-10 md:py-14">
        <ShowcaseHeadline activeStep={activeStep} onStepChange={handleStepChange} />

        <div className="mt-10">
          <ShowcaseWorkflowStrip activeStep={activeStep} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-8">
          {PUBLIC_TOOLS.map((tool, index) => (
            <ShowcaseToolCard
              key={tool.id}
              tool={tool}
              path={tool.getPath({ isJournalist })}
              index={index}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <ChevronDown className="home-showcase-scroll-hint size-6 text-muted-foreground/40" />
        </div>
      </div>
    </section>
  );
}
