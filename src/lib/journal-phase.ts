export type Phase = "arrive" | "journal";

export const JOURNAL_PHASE = "stream=1";

export function phaseOf(params: URLSearchParams): Phase {
  const stream = new URLSearchParams(JOURNAL_PHASE).get("stream");
  return params.get("stream") === stream ? "journal" : "arrive";
}

export function phaseSearch(phase: Phase): string {
  return phase === "journal" ? JOURNAL_PHASE : "";
}
