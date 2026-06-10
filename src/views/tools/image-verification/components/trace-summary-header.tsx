import { groupAppearancesByDomain } from "@/lib/image-verification-utils";
import type { ImageVerificationResult } from "@/types/image-verification";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AnimatedCount from "./animated-count";
import DomainConstellation from "./domain-constellation";

interface TraceSummaryHeaderProps {
  result: ImageVerificationResult;
}

export default function TraceSummaryHeader({ result }: TraceSummaryHeaderProps) {
  const { t } = useTranslation();
  const domainGroups = groupAppearancesByDomain(result.appearances);
  const uniqueDomains = domainGroups.length;

  return (
    <div className="flex flex-col gap-5 border-b border-border bg-gradient-to-br from-amber-50/80 via-white to-slate-50 px-6 py-5 sm:flex-row sm:items-center">
      <motion.div
        layoutId="source-image"
        className="mx-auto shrink-0 overflow-hidden rounded-xl border-2 border-[var(--investigation-amber)]/30 shadow-[0_0_24px_var(--investigation-glow)] sm:mx-0"
        style={{ width: 120, height: 120 }}
      >
        <img
          src={result.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      </motion.div>

      <div className="min-w-0 flex-1 space-y-3 text-center sm:text-start">
        <h2 className="text-headline-sm">{t("imageVerification.resultsTitle")}</h2>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <p className="text-sm text-muted-foreground">
            <AnimatedCount
              value={result.appearances.length}
              className="font-semibold text-foreground"
            />{" "}
            {t("imageVerification.appearancesCount")}
          </p>
          <p className="text-sm text-muted-foreground">
            <AnimatedCount
              value={uniqueDomains}
              className="font-semibold text-foreground"
            />{" "}
            {t("imageVerification.domainsCount")}
          </p>
        </div>
        {domainGroups.length > 0 ? (
          <DomainConstellation domains={domainGroups} />
        ) : null}
      </div>
    </div>
  );
}
