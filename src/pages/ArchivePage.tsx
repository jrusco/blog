import { useLayoutEffect } from "react";
import { Column } from "../components/Column";

export function ArchivePage() {
  useLayoutEffect(() => {
    document.title = "Archive · Criterio";
  }, []);

  return (
    <Column>
      <h1 className="text-title">Archive</h1>
    </Column>
  );
}
