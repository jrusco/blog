import { describe, expect, it } from "vitest";
import { phaseOf, phaseSearch } from "./journal-phase";

describe("journal phase in the URL", () => {
  it("writes the journal phase as ?stream=1 and the arrive phase as nothing", () => {
    expect(phaseSearch("journal")).toBe("?stream=1");
    expect(phaseSearch("arrive")).toBe("");
  });

  it.each(["journal", "arrive"] as const)("reads back the %s phase it wrote", (phase) => {
    expect(phaseOf(new URLSearchParams(phaseSearch(phase)))).toBe(phase);
  });

  it.each(["", "?stream=0", "?stream=", "?other=1"])("reads %j as the arrive phase", (search) => {
    expect(phaseOf(new URLSearchParams(search))).toBe("arrive");
  });
});
