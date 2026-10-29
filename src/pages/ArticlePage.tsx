import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { formatDate, getArticle } from "../lib/articles";
import { JOURNAL_PHASE } from "../lib/journal-phase";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  return (
    <article className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-8">
      <Link to={{ pathname: "/", search: `?${JOURNAL_PHASE}` }} className="text-sm text-muted-foreground hover:text-foreground">
        ← The field
      </Link>
      {article ? (
        <>
          <p className="mt-10 text-sm tracking-wide text-muted-foreground">{formatDate(article.date)}</p>
          <h1 className="mt-3 text-5xl font-normal leading-none sm:text-6xl">{article.title}</h1>
          <div className="article-body mt-8 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-10 text-5xl font-normal">This page blew past.</h1>
          <p className="mt-4 text-muted-foreground">No article matches that name.</p>
        </>
      )}
    </article>
  );
}
