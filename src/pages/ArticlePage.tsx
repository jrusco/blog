import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Field, displayFont } from "../components/Field";
import { formatDate, getArticle } from "../lib/articles";

export function ArticlePage() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  return (
    <Field dim>
      <article className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-24 pt-8">
        <Link to="/?stream=1" className="text-sm text-muted-foreground hover:text-foreground">
          ← The field
        </Link>
        {article ? (
          <>
            <p className="mt-10 text-sm tracking-wide text-muted-foreground">{formatDate(article.date)}</p>
            <h1 className="mt-3 text-5xl font-normal leading-none sm:text-6xl" style={displayFont}>
              {article.title}
            </h1>
            <div className="article-body mt-8 text-base leading-relaxed text-foreground/90 sm:text-lg">
              <ReactMarkdown>{article.body}</ReactMarkdown>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-5xl font-normal" style={displayFont}>
              This page blew past.
            </h1>
            <p className="mt-4 text-muted-foreground">No article matches that name.</p>
          </>
        )}
      </article>
    </Field>
  );
}
