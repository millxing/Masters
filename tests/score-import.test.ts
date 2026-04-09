import { describe, expect, it } from "vitest";
import { normalizeName } from "@/lib/score-import";

describe("normalizeName", () => {
  it("folds accents so ESPN player names match stored golfer names", () => {
    expect(normalizeName("Ludvig Åberg")).toBe(normalizeName("Ludvig Aberg"));
  });
});
