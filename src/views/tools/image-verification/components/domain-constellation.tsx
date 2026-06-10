import { getBubbleSize } from "@/lib/image-verification-utils";
import type { DomainGroup } from "@/types/image-verification";
import { motion } from "framer-motion";

interface DomainConstellationProps {
  domains: DomainGroup[];
}

export default function DomainConstellation({ domains }: DomainConstellationProps) {
  const maxCount = domains[0]?.count ?? 1;
  const topDomains = domains.slice(0, 6);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {topDomains.map((group, index) => {
        const size = getBubbleSize(group.count, maxCount);
        return (
          <motion.div
            key={group.domain}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + index * 0.08, type: "spring", stiffness: 200 }}
            className="group relative flex flex-col items-center gap-1"
            title={`${group.domain}: ${group.count}`}
          >
            <div
              className="flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--investigation-amber)]/25 bg-white shadow-sm transition-transform group-hover:scale-105"
              style={{ width: size, height: size }}
            >
              {group.logo ? (
                <img
                  src={group.logo}
                  alt=""
                  className="size-[55%] object-contain"
                />
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground">
                  {group.domain.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <span className="max-w-[72px] truncate text-[9px] text-muted-foreground">
              {group.domain}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
