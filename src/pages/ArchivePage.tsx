import { useLayoutEffect } from "react";
import { Column } from "../components/Column";

export function ArchivePage() {
  useLayoutEffect(() => {
    document.title = "Archive · Criterio";
  }, []);

  return (
    <Column className="pt-8">
      <h1 className="text-title">Archive</h1>
    </Column>
  );
}
