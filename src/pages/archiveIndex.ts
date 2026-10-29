import { getArticles, type Article } from "../lib/articles";

export type ArchiveYear = {
  year: string;
  posts: Article[];
};

export class ArchiveIndex {
  static posts(): Article[] {
    return getArticles();
  }

  static byYear(posts: readonly Article[] = ArchiveIndex.posts()): ArchiveYear[] {
    const years: ArchiveYear[] = [];
    for (const post of [...posts].sort((a, b) => ArchiveIndex.newestFirst(a, b))) {
      const year = ArchiveIndex.yearOf(post.date);
      const current = years.at(-1);
      if (current?.year === year) current.posts.push(post);
      else years.push({ year, posts: [post] });
    }
    return years;
  }

  private static newestFirst(a: Article, b: Article): number {
    if (a.date === b.date) return a.title.localeCompare(b.title);
    return a.date < b.date ? 1 : -1;
  }

  private static yearOf(date: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date.slice(0, 4) : date;
  }
}
