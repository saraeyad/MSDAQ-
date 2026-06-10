import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";
import { motion } from "framer-motion";
import { Link2, PenLine, Send, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export type PublishingWorkflowStep = "write" | "check" | "source" | "publish";

const STEPS: Array<{
  id: PublishingWorkflowStep;
  icon: LucideIcon;
  href: string | ((editorId?: number) => string);
}> = [
  { id: "write", icon: PenLine, href: ROUTES.JOURNALIST_EDITOR },
  { id: "source", icon: Link2, href: (id) => (id ? `${ROUTES.JOURNALIST_EDITOR}?id=${id}` : ROUTES.JOURNALIST_EDITOR) },
  { id: "check", icon: ShieldCheck, href: (id) => (id ? `${ROUTES.JOURNALIST_EDITOR}?id=${id}` : ROUTES.JOURNALIST_EDITOR) },
  { id: "publish", icon: Send, href: `${ROUTES.JOURNALIST_ARCHIVE}?tab=published` },
];

interface PublishingWorkflowStripProps {
  variant?: "full" | "compact";
  activeStep?: PublishingWorkflowStep;
  editorArticleId?: number;
  className?: string;
}

export default function PublishingWorkflowStrip({
  variant = "full",
  activeStep,
  editorArticleId,
  className,
}: PublishingWorkflowStripProps) {
  const { t } = useTranslation();
  const isCompact = variant === "compact";

  return (
    <div className={cn("publishing-workflow-strip", isCompact && "publishing-workflow-strip-compact", className)}>
      {!isCompact ? (
        <div className="relative mx-auto hidden max-w-4xl px-4 lg:block">
          <svg viewBox="0 0 800 40" className="h-10 w-full" aria-hidden>
            <motion.path
              d="M 60 20 L 280 20 L 520 20 L 740 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 8"
              className="text-border"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3",
          isCompact ? "grid-cols-2 sm:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const href =
            typeof step.href === "function" ? step.href(editorArticleId) : step.href;
          const isActive = activeStep === step.id;

          return (
            <Link
              key={step.id}
              to={href}
              className={cn(
                "publishing-workflow-step group block rounded-lg border border-border/60 bg-background/70 p-4 transition-all hover:-translate-y-0.5 hover:border-accent-editor/30 hover:bg-accent-editor/5",
                isActive && "border-accent-editor/40 bg-accent-editor/8 ring-1 ring-accent-editor/20",
                isCompact && "p-3",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-accent-editor">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md border border-accent-editor/20 bg-accent-editor/10 text-accent-editor",
                    isCompact && "size-6",
                  )}
                >
                  <Icon className={isCompact ? "size-3" : "size-3.5"} />
                </div>
              </div>
              <p className={cn("mt-2 font-semibold text-foreground", isCompact ? "text-xs" : "text-sm")}>
                {t(`journalist.dashboard.steps.${step.id}`)}
              </p>
              {!isCompact ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`journalist.dashboard.stepHints.${step.id}`)}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
