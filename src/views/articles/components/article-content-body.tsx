import type { Article, ArticleLanguage } from "@/types/article";

interface ArticleContentBodyProps {
  article: Article;
  language: ArticleLanguage;
}

export default function ArticleContentBody({
  article,
  language,
}: ArticleContentBodyProps) {
  const lead = article.lead?.[language];
  const paragraphs =
    article.bodyParagraphs?.[language] ??
    (article.content[language] ? [article.content[language]] : []);
  const quote = article.quote?.[language];

  return (
    <div className="max-w-3xl space-y-6">
      {lead ? (
        <p className="text-body-lg leading-relaxed text-foreground">{lead}</p>
      ) : null}

      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-body-md leading-relaxed text-foreground">
          {paragraph}
        </p>
      ))}

      {quote ? (
        <blockquote className="border-s-4 border-secondary ps-5 text-body-lg leading-relaxed text-secondary">
          {quote}
        </blockquote>
      ) : null}
    </div>
  );
}
