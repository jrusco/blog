import { Children, isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { imageFor } from "../lib/articles";
import { rehypeLowlight } from "../lib/highlight";
import { CodeBlock } from "./CodeBlock";
import { YouTubeFacade, youtubeTarget } from "./YouTubeFacade";

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function meaningful(children: ReactNode) {
  return Children.toArray(children).filter((node) => {
    if (typeof node === "string") return node.trim() !== "";
    return node != null && typeof node !== "boolean";
  });
}

function MarkdownImage({ src, alt, title }: { src?: string; alt?: string; title?: string }) {
  const meta = imageFor(src);
  if (src && !meta) console.error(`Unknown image path: ${src}`);
  const caption = title?.trim();
  return (
    <figure className="media max-sm:-mx-5 lg:-mx-22">
      <img
        src={meta?.src ?? src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 1024px) 46rem, (min-width: 640px) 35rem, 100vw"
        {...(meta ? { width: meta.width, height: meta.height } : {})}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function MarkdownParagraph({ children }: { children?: ReactNode }) {
  const nodes = meaningful(children);
  if (nodes.length === 1 && isValidElement(nodes[0])) {
    const only = nodes[0];
    if (only.type === MarkdownImage) return only;
    if (only.type === "a") {
      const props = only.props as { href?: string; children?: ReactNode };
      const video = props.href ? youtubeTarget(props.href) : null;
      const title = textOf(props.children).trim();
      if (video && title) return <YouTubeFacade id={video.id} title={title} start={video.start} />;
    }
  }
  return <p>{children}</p>;
}

const components: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  p: MarkdownParagraph,
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  img: MarkdownImage,
  table: ({ children }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeLowlight];
const remarkRehypeOptions = {
  footnoteLabel: "Notes",
  footnoteLabelTagName: "h2",
  footnoteLabelProperties: { className: ["footnotes-label"] },
  footnoteBackContent: "↑\uFE0E",
};

export function ArticleMarkdown({ body }: { body: string }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} remarkRehypeOptions={remarkRehypeOptions} components={components}>
      {body}
    </ReactMarkdown>
  );
}
