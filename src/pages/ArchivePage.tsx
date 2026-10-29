import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { Column } from "../components/Column";
import type { Article } from "../lib/articles";
import { ArchiveIndex } from "./archiveIndex";

export function ArchivePage() {
  useLayoutEffect(() => {
    document.title = "Archive · Criterio";
  }, []);

  return (
    <Column className="pt-8">
      <h1 className="text-title">Archive</h1>
      <ArchiveList posts={ArchiveIndex.posts()} />
    </Column>
  );
}

export function ArchiveList({ posts }: { posts: readonly Article[] }) {
  return ArchiveIndex.byYear(posts).map((group) => (
    <section key={group.year} className="mt-12">
      <h2 className="font-mono text-small font-normal text-muted">{group.year}</h2>
      <ol className="mt-4 flex flex-col gap-6">
        {group.posts.map((post) => (
          <li
            key={post.slug}
            className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-4"
          >
            <time dateTime={post.date} className="font-mono text-small font-normal text-muted">
              {post.date}
            </time>
            <div className="min-w-0">
              <Link to={`/journal/${post.slug}`} className="font-serif text-list-title font-semibold text-ink">
                {post.title}
              </Link>
              <p className="mt-2 font-serif text-summary font-normal text-muted">{post.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  ));
}
