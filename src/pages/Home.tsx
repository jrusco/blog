import { useLayoutEffect } from "react";
import { Field } from "../components/Field";
import { PaperStream } from "../components/PaperStream";
import { SiteFooter } from "../components/SiteFooter";
import { getArticles } from "../lib/articles";

const articles = getArticles();

export function Home() {
  useLayoutEffect(() => {
    document.title = "Criterio · a public notebook";
  }, []);

  return (
    <Field>
      <h1 className="sr-only">Criterio · a public notebook</h1>
      <PaperStream articles={articles} />
      <SiteFooter />
    </Field>
  );
}
