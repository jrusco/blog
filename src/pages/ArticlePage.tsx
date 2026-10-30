import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Column } from "../components/Column";
import { ArticleMarkdown } from "../components/MarkdownBody";
import { formatDate, getArticle } from "../lib/articles";
import { NotFound } from "./NotFound";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  const title = article?.title;
  useLayoutEffect(() => {
    if (title) document.title = `${title} · Criterio`;
  }, [title]);

  if (!article) return <NotFound kind="article" />;

  return (
    <Column>
      <div className="pt-8">
        <Link to="/" className="inline-flex min-h-11 items-center text-meta text-muted hover:text-ink">
          ← Criterio
        </Link>
      </div>
      <article className="w-full min-w-0">
        <header className="mt-10">
          {article.draft ? <p className="mb-3 font-mono text-meta text-accent">TEST FIXTURE · NOT PUBLISHED</p> : null}
          <time dateTime={article.date} className="font-mono text-meta uppercase text-muted">
            {formatDate(article.date)}
          </time>
          <h1 className="article-title mt-3 text-title">{article.title}</h1>
          {article.summary ? <p className="dek mt-4">{article.summary}</p> : null}
        </header>
        <div className="article-body mt-10 text-body text-ink sm:mt-12">
          <ArticleMarkdown body={article.body} />
        </div>
      </article>
    </Column>
  );
}
