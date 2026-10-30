import { createLowlight } from "lowlight";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import diff from "highlight.js/lib/languages/diff";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

const lowlight = createLowlight();
lowlight.register({ bash, css, diff, javascript, json, markdown, typescript, xml });

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: { className?: string | string[] };
  children?: HastNode[];
};

function classList(node: HastNode): string[] {
  const value = node.properties?.className;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string" && value.trim()) return value.trim().split(/\s+/);
  return [];
}

function textContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textContent).join("");
}

function highlightCode(node: HastNode) {
  const info = classList(node).find((name) => name.startsWith("language-"))?.slice("language-".length) ?? "";
  const value = textContent(node);
  node.properties = {
    ...node.properties,
    className: ["hljs", ...(info ? [`language-${info}`] : [])],
  };
  if (!info || !lowlight.registered(info)) {
    node.children = [{ type: "text", value }];
    return;
  }
  node.children = lowlight.highlight(info, value).children as HastNode[];
}

function walk(node: HastNode) {
  for (const child of node.children ?? []) {
    if (child.type === "element" && child.tagName === "code" && node.tagName === "pre") {
      highlightCode(child);
      continue;
    }
    walk(child);
  }
}

export function rehypeLowlight() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
