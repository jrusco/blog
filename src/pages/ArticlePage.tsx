import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { formatDate, getArticle } from "../lib/articles";
import { JOURNAL_PHASE } from "../lib/journal-phase";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  return (
    <article className="relative z-10 mx-auto w-full max-w-measure px-6 pb-24 pt-8">
      <Link to={{ pathname: "/", search: `?${JOURNAL_PHASE}` }} className="text-meta text-muted hover:text-ink">
        ← The field
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
  );
}
