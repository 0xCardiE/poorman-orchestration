import { describe, expect, it } from "vitest";
import { navigationItems } from "../src/lib/navigation";

describe("navigationItems", () => {
  it("covers the four planned top-level sections", () => {
    expect(navigationItems.map((item) => item.id)).toEqual([
      "sources",
      "topics",
      "claims",
      "digests",
    ]);
  });
});
