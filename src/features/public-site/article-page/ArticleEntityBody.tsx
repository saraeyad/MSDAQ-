import {
  entityInternalPath,
  isInternalEntityLink,
  splitArticleEntities,
} from "@/lib/articles/entity-links";
import type { PublicArticleEntity } from "@/types";
import { Link } from "react-router-dom";

interface ArticleEntityBodyProps {
  text: string;
  entities?: PublicArticleEntity[] | null;
}

export function ArticleEntityBody({ text, entities }: ArticleEntityBodyProps) {
  const pieces = splitArticleEntities(text, entities);

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
              className="article-entity-link"
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
            className="article-entity-link article-entity-link--external"
            title={piece.entity.url}
          >
            {piece.value}
            <span className="article-entity-link__ext" aria-hidden>
              ↗
            </span>
          </a>
        );
      })}
    </>
  );
}
