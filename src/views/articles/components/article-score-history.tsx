import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScoreHistoryEntry } from "@/types/article";
import { useTranslation } from "react-i18next";

interface ArticleScoreHistoryProps {
  history: ScoreHistoryEntry[];
}

export default function ArticleScoreHistory({ history }: ArticleScoreHistoryProps) {
  const { t } = useTranslation();

  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="font-headline text-base">{t("articles.scoreHistoryTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("COLUMNS.SUBMITTED_AT")}</TableHead>
              <TableHead>{t("scores.trust")}</TableHead>
              <TableHead>{t("scores.credibility")}</TableHead>
              <TableHead>{t("articles.note")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.trustScore}</TableCell>
                <TableCell>{entry.credibilityScore}</TableCell>
                <TableCell>{entry.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
