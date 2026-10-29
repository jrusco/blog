export type Phase = "arrive" | "journal";

const PHASE_KEY = "stream";
const JOURNAL_VALUE = "1";

export function phaseOf(params: URLSearchParams): Phase {
  return params.get(PHASE_KEY) === JOURNAL_VALUE ? "journal" : "arrive";
}

export function phaseSearch(phase: Phase): string {
  return phase === "journal" ? `?${PHASE_KEY}=${JOURNAL_VALUE}` : "";
}
