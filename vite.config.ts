import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { imageSize } from "image-size";
import { defineConfig, type Plugin } from "vite";

// remark-gfm also pulls a markdown serializer, the SVG attribute map, and style
// parsing. None of that runs while rendering a post, and keeping it put the
// post chunk over 60 kB gzip. These stubs stand in for the unused modules.
const markdownStringifyStub = resolve("src/lib/markdown-stringify-stub.ts");
const markdownTableStub = resolve("src/lib/markdown-table-stub.ts");
const styleToJsStub = resolve("src/lib/style-to-js-stub.ts");
const svgInfoStub = resolve("src/lib/svg-info-stub.ts");

function slimMarkdown(): Plugin {
  return {
    name: "slim-markdown",
    enforce: "pre",
    resolveId(id, importer) {
      if (!importer?.includes("property-information")) return null;
      if (id === "./lib/svg.js" || id.endsWith("/property-information/lib/svg.js")) return svgInfoStub;
      return null;
    },
  };
}

function imageDimensions(): Plugin {
  return {
    name: "image-dimensions",
    enforce: "pre",
    load(id) {
      if (!id.endsWith("?size")) return null;
      const file = id.slice(0, -5);
      if (!/\.(avif|jpe?g|png|webp)$/i.test(file)) return null;
      const { width, height } = imageSize(readFileSync(file));
      if (!width || !height) return null;
      return `import src from ${JSON.stringify(file)}; export default { src, width: ${width}, height: ${height} };`;
    },
  };
}

function dropUnreferencedImages(): Plugin {
  return {
    name: "drop-unreferenced-images",
    generateBundle(_options, bundle) {
      for (const file of Object.keys(bundle)) {
        if (!/\.(avif|jpe?g|png|webp)$/i.test(file)) continue;
        const name = file.split("/").pop() ?? file;
        const referenced = Object.values(bundle).some((item) => {
          if (item.type === "chunk") return item.code.includes(name);
          if (item.type === "asset" && typeof item.source === "string") return item.source.includes(name);
          return false;
        });
        if (!referenced) delete bundle[file];
      }
    },
  };
}

export default defineConfig({
  base: "/blog/",
  resolve: {
    alias: {
      "markdown-table": markdownTableStub,
      "mdast-util-to-markdown": markdownStringifyStub,
      "style-to-js": styleToJsStub,
    },
  },
  plugins: [slimMarkdown(), imageDimensions(), dropUnreferencedImages(), react(), tailwindcss()],
});
