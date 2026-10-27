import { describe, expect, it } from "vitest";
import { isTabReachable } from "./visibility";

const VIEWPORT = { width: 1000, height: 800 };

function box(left: number, top: number, width: number, height: number) {
  return { left, top, right: left + width, bottom: top + height, width, height };
}

function reachable(rect: ReturnType<typeof box>) {
  return isTabReachable(rect, VIEWPORT.width, VIEWPORT.height);
}

describe("isTabReachable", () => {
  it("accepts a sheet exactly 60% inside the viewport", () => {
    expect(reachable(box(-40, 100, 100, 100))).toBe(true);
  });

  it("rejects a sheet 59% inside the viewport", () => {
    expect(reachable(box(-41, 100, 100, 100))).toBe(false);
  });

  it("rejects a sheet fully outside on the left", () => {
    expect(reachable(box(-300, 100, 100, 100))).toBe(false);
  });

  it("rejects a sheet fully outside on the right", () => {
    expect(reachable(box(1100, 100, 100, 100))).toBe(false);
  });

  it("accepts a sheet fully inside", () => {
    expect(reachable(box(400, 100, 100, 100))).toBe(true);
  });
});
