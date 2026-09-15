import {
  entityInternalPath,
  isInternalEntityLink,
  splitArticleEntities,
} from "@/lib/articles/entity-links";
import { cn } from "@/lib/utils";
import type { PublicArticleEntity } from "@/types";
import { Link } from "react-router-dom";

interface ArticleEntityBodyProps {
  text: string;
  entities?: PublicArticleEntity[] | null;
  tone?: "body" | "heading";
}

export function ArticleEntityBody({
  text,
  entities,
  tone = "body",
}: ArticleEntityBodyProps) {
  const pieces = splitArticleEntities(text, entities);
  const heading = tone === "heading";
  const linkClass = cn(
    "article-entity-link",
    heading && "article-entity-link--heading",
  );

  return (
    <>
      {pieces.map((piece, index) => {
        if (piece.type === "text") {
          return <span key={`t-${index}`}>{piece.value}</span>;
        }

        if (isInternalEntityLink(piece.entity)) {
          return (
            <Link
              key={`e-${index}`}
              to={entityInternalPath(piece.entity.url)}
              className={linkClass}
              title={piece.entity.url}
            >
              {piece.value}
            </Link>
          );
        }

        return (
          <a
            key={`e-${index}`}
            href={piece.entity.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(linkClass, "article-entity-link--external")}
            title={piece.entity.url}
          >
            {piece.value}
            {heading ? null : (
              <span className="article-entity-link__ext" aria-hidden>
                ↗
              </span>
            )}
          </a>
        );
      })}
    </>
  );
}
