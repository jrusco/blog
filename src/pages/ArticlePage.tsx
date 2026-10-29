import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Column } from "../components/Column";
import { formatDate, getArticle } from "../lib/articles";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  useLayoutEffect(() => {
    document.title = article ? `${article.title} · Criterio` : "Not found · Criterio";
  }, [article?.title]);

  return (
    <Column>
      <article className="w-full pb-24 pt-8">
        <Link to="/" className="inline-flex items-center min-h-11 text-meta text-muted hover:text-ink">
          ← Criterio
        </Link>
        {article ? (
          <>
            <p className="mt-10 text-meta text-muted">{formatDate(article.date)}</p>
            <h1 className="mt-3 text-title">{article.title}</h1>
            <div className="article-body mt-8 text-body text-ink">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-title">This page blew past.</h1>
            <p className="mt-4 text-body text-muted">No article matches that name.</p>
          </>
        )}
      </article>
    </Column>
  );
}
