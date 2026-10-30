import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function canCopy() {
  try {
    return typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function";
  } catch {
    return false;
  }
}

export function CodeBlock({ children }: { children?: ReactNode }) {
  const code = textOf(children);
  const codeElement = Children.toArray(children).find(isValidElement);
  const className =
    codeElement && isValidElement<{ className?: string }>(codeElement) ? (codeElement.props.className ?? "") : "";
  const info = /(?:^|\s)language-([^\s]+)/.exec(className)?.[1] ?? "";
  const [copied, setCopied] = useState(false);
  const copyable = canCopy();

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <figure className="code max-sm:-mx-5 lg:-mx-22">
      <div className="code-bar flex h-8 items-center justify-between border-b border-hairline px-4 font-mono text-meta text-muted">
        <span>{info}</span>
        {copyable ? (
          <button
            type="button"
            className={`h-8 bg-transparent px-2 font-mono text-meta ${copied ? "text-ink" : "text-muted hover:text-ink"}`}
            onClick={() => {
              void navigator.clipboard.writeText(code).then(
                () => setCopied(true),
                () => setCopied(false),
              );
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
      <pre tabIndex={0}>{children}</pre>
    </figure>
  );
}
