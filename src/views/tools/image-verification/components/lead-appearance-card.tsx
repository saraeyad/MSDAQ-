import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ImageAppearance } from "@/types/image-verification";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LeadAppearanceCardProps {
  appearance: ImageAppearance;
}

export default function LeadAppearanceCard({ appearance }: LeadAppearanceCardProps) {
  const { t } = useTranslation();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl border border-border border-s-4 border-s-[var(--investigation-amber)] bg-card shadow-sm"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={appearance.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <Badge className="absolute start-3 top-3 bg-[var(--investigation-amber)] text-white">
          {t("imageVerification.leadMatch")}
        </Badge>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          {appearance.logo ? (
            <img src={appearance.logo} alt="" className="size-5 rounded-sm object-contain" />
          ) : null}
          <span className="text-sm font-medium text-muted-foreground">{appearance.domain}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {appearance.date}
          </span>
        </div>
        <h3 className="line-clamp-3 text-base font-semibold leading-snug text-foreground">
          {appearance.title}
        </h3>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href={appearance.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            {t("imageVerification.openSource")}
          </a>
        </Button>
      </div>
    </motion.article>
  );
}
