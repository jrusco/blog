import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { Column } from "../components/Column";

export function NotFound({ kind }: { kind: "article" | "route" }) {
  useLayoutEffect(() => {
    document.title = "Not found · Criterio";
  }, []);

  return (
    <Column>
      <div className="pt-8">
        <Link to="/" className="inline-flex min-h-11 items-center text-meta text-muted hover:text-ink">
          ← Criterio
        </Link>
      </div>
      <h1 className="mt-10 text-title">This page blew past.</h1>
      <div className="article-body">
        <p className="mt-4 text-body text-muted">
          {kind === "article" ? "No article matches that name." : "Nothing lives at this address."}
        </p>
        <p>
          <Link to="/archive">Browse the archive</Link>
        </p>
      </div>
    </Column>
  );
}
