import ScoreRing from "@/components/score-ring";
import { cn } from "@/lib/utils";
import type { PublicTool } from "@/lib/tool-config";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface ShowcaseToolCardProps {
  tool: PublicTool;
  path: string;
  index: number;
}

function CredibilityMiniVisual() {
  return (
    <div className="flex items-center gap-3">
      <ScoreRing score={94} size="sm" label="" animated />
      <div className="flex flex-wrap gap-1.5">
        {["verified", "disputed", "false"].map((v) => (
          <span
            key={v}
            className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function EditorMiniVisual() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Standards</span>
        <span className="font-semibold text-accent-editor">87%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-accent-editor"
          initial={{ width: 0 }}
          whileInView={{ width: "87%" }}
          transition={{ duration: 1.2, delay: 0.3 }}
          viewport={{ once: true }}
        />
      </div>
      <span className="inline-block rounded-full bg-accent-editor/10 px-2 py-0.5 text-[10px] font-medium text-accent-editor">
        Fusha ✓
      </span>
    </div>
  );
}

function ImageTraceMiniVisual() {
  return (
    <div className="relative flex h-16 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute size-12 rounded border-2 border-white bg-muted shadow-sm"
          style={{ zIndex: i }}
          initial={{ rotate: (i - 1) * 6, x: (i - 1) * 16 }}
          whileHover={{ rotate: (i - 1) * 12, x: (i - 1) * 22 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
      ))}
    </div>
  );
}

function MiniVisual({ toolId }: { toolId: PublicTool["id"] }) {
  if (toolId === "credibility") return <CredibilityMiniVisual />;
  if (toolId === "smartEditor") return <EditorMiniVisual />;
  return <ImageTraceMiniVisual />;
}

const VERB_FONT_CLASS: Record<PublicTool["id"], string> = {
  credibility: "showcase-verb-font-investigate",
  smartEditor: "showcase-verb-font-verify",
  imageTrace: "showcase-verb-font-trace",
};

const VERB_POSITION_CLASS: Record<PublicTool["id"], string> = {
  credibility: "showcase-card-verb-investigate",
  smartEditor: "showcase-card-verb-verify",
  imageTrace: "showcase-card-verb-trace",
};

export default function ShowcaseToolCard({ tool, path, index }: ShowcaseToolCardProps) {
  const { t } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const reduceMotion = useReducedMotion();
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const Icon = tool.icon;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformPerspective: 800 }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      <Link
        to={path}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br shadow-sm transition-all duration-300",
          !reduceMotion && "hover:-translate-y-2",
          tool.gradientClass,
          !reduceMotion && tool.portalHoverClass,
          !reduceMotion && tool.accent.hoverGlow,
        )}
      >
        <span
          aria-hidden
          className={cn(
            "showcase-card-verb",
            VERB_FONT_CLASS[tool.id],
            VERB_POSITION_CLASS[tool.id],
            tool.accent.text,
          )}
          style={{ animationDelay: `${index * 0.15 + 0.2}s, ${index * 0.15 + 1.1}s` }}
        >
          {t(tool.i18n.workflowVerb)}
        </span>

        <div className={cn("relative z-[1] h-1.5 w-full", tool.accent.strip)} />

        <div className="relative z-[1] flex flex-1 flex-col p-5 md:p-6">
          <span
            className={cn(
              "mb-4 block font-mono text-xs font-bold tabular-nums",
              tool.accent.text,
            )}
          >
            {String(tool.step).padStart(2, "0")}
          </span>

          <div
            className={cn(
              "mb-4 flex size-12 items-center justify-center rounded-lg border",
              tool.accent.bg,
              tool.accent.border,
              tool.accent.text,
            )}
          >
            <Icon className="size-6" />
          </div>

          <h3 className="text-headline-sm">{t(tool.i18n.title)}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {t(tool.i18n.description)}
          </p>

          <div className="my-4 rounded-lg border border-border/50 bg-background/60 p-3 backdrop-blur-sm">
            <MiniVisual toolId={tool.id} />
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3",
              tool.accent.text,
            )}
          >
            {t(tool.i18n.cta)}
            <ArrowIcon className="size-4" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
