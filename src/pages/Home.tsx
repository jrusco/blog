import { Field } from "../components/Field";
import { PaperStream } from "../components/PaperStream";
import { getArticles } from "../lib/articles";

const articles = getArticles();

export function Home() {
  return (
    <Field>
      <PaperStream articles={articles} />
    </Field>
  );
}
