import { describe, expect, it } from "vitest";
import { streamLayout } from "./articles";

describe("streamLayout scale ladder", () => {
  it.each([
    [1, 1.4],
    [2, 1.25],
    [3, 1.12],
    [4, 1],
    [5, 1],
  ])("scales %i article(s) by %f", (count, scale) => {
    expect(streamLayout(count, false).scale).toBe(scale);
  });
});
