import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ArticleSource } from "@/types/article";
import { useTranslation } from "react-i18next";

interface ArticleSourcesTableProps {
  sources: ArticleSource[];
}

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline"> = {
  verified: "success",
  under_review: "secondary",
  unverified: "outline",
};

export default function ArticleSourcesTable({
  sources,
}: ArticleSourcesTableProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-headline-sm">{t("articles.sourcesTableTitle")}</h2>

      <div className="overflow-hidden rounded border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead>{t("articles.sourceColumn")}</TableHead>
              <TableHead>{t("articles.typeColumn")}</TableHead>
              <TableHead>{t("articles.verificationColumn")}</TableHead>
              <TableHead className="text-end">
                {t("articles.reliabilityColumn")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((source) => {
              const status = source.verificationStatus ?? "verified";
              const category =
                source.sourceCategory ??
                t(`articles.sourceType.${source.type}`);
              const reliability = source.reliability ?? 80;

              return (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-secondary hover:underline"
                      >
                        {source.label}
                      </a>
                    ) : (
                      source.label
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
                      {t(`articles.verificationStatus.${status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end font-semibold">
                    {reliability}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
