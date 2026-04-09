import { describe, expect, it } from "vitest";
import { buildGolferScoreboardRows } from "@/lib/pool-display";
import type { PlayerScore } from "@/lib/types";

function buildScore(
  golferCode: string,
  golferName: string,
  total: number | null,
  status: string,
  rounds: Array<number | null>
): PlayerScore {
  return {
    snapshotId: "snapshot_1",
    golferCode,
    golferName,
    status,
    rounds,
    total
  };
}

describe("buildGolferScoreboardRows", () => {
  it("sorts golfers by total and labels tied positions", () => {
    const rows = buildGolferScoreboardRows([
      buildScore("b", "Justin Rose", 277, "-11", [65, 71, 75, 66]),
      buildScore("a", "Rory McIlroy", 277, "-11", [72, 66, 66, 73]),
      buildScore("c", "Scottie Scheffler", 280, "-8", [68, 71, 72, 69])
    ]);

    expect(rows.map((row) => row.golferName)).toEqual([
      "Justin Rose",
      "Rory McIlroy",
      "Scottie Scheffler"
    ]);
    expect(rows.map((row) => row.position)).toEqual(["T1", "T1", "3"]);
    expect(rows.map((row) => row.score)).toEqual(["-11", "-11", "-8"]);
  });

  it("derives a score display from total when status is blank", () => {
    const [row] = buildGolferScoreboardRows([
      buildScore("a", "Rory McIlroy", 138, "", [72, 66, null, null])
    ]);

    expect(row?.score).toBe("-6");
  });

  it("assigns CUT golfers fallback sort values for missing rounds", () => {
    const rows = buildGolferScoreboardRows([
      buildScore("a", "Russell Henley", 147, "CUT", [79, 68, null, null]),
      buildScore("b", "Rory McIlroy", 277, "-11", [72, 66, 66, 73]),
      buildScore("c", "Scottie Scheffler", 280, "-8", [68, 71, 72, 69])
    ]);

    const cutRow = rows.find((candidate) => candidate.golferCode === "a");

    expect(cutRow?.score).toBe("CUT");
    expect(cutRow?.roundValues).toEqual([79, 68, 73, 74]);
    expect(cutRow?.totalValue).toBe(294);
  });
});
