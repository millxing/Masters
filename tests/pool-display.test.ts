import { describe, expect, it } from "vitest";
import { buildGolferScoreboardRows, buildOverallRows, buildRoundRows } from "@/lib/pool-display";
import type { Golfer, PlayerScore, Submission, TeamStanding } from "@/lib/types";

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

describe("results row slot ordering", () => {
  const golfers: Golfer[] = [
    { code: "a", name: "Alpha", odds: 0, probability: 0, isActive: true, createdAt: "", updatedAt: "" },
    { code: "b", name: "Bravo", odds: 0, probability: 0, isActive: true, createdAt: "", updatedAt: "" },
    { code: "c", name: "Charlie", odds: 0, probability: 0, isActive: true, createdAt: "", updatedAt: "" }
  ];

  const submissions: Submission[] = [{
    id: "sub_1",
    tournamentId: "tournament_1",
    participantName: "Captain",
    email: "",
    venmoHandle: null,
    teamName: "Team One",
    picks: ["a", "b", "c"],
    probabilityTotal: 0,
    paymentStatus: "paid",
    editCode: "",
    createdAt: "",
    updatedAt: "",
    lockedAt: null
  }];

  const standings: TeamStanding[] = [{
    submissionId: "sub_1",
    teamName: "Team One",
    participantName: "Captain",
    picks: ["a", "b", "c"],
    probabilityTotal: 0,
    rounds: [{
      round: 1,
      score: 210,
      tiebreak: 72,
      countedCodes: ["a", "b", "c"],
      fallbackScore: 91,
      rank: 1,
      split: false
    }, {
      round: 2,
      score: 0,
      tiebreak: 0,
      countedCodes: [],
      fallbackScore: 0,
      rank: 1,
      split: false
    }, {
      round: 3,
      score: 0,
      tiebreak: 0,
      countedCodes: [],
      fallbackScore: 0,
      rank: 1,
      split: false
    }, {
      round: 4,
      score: 0,
      tiebreak: 0,
      countedCodes: [],
      fallbackScore: 0,
      rank: 1,
      split: false
    }],
    final: {
      score: 840,
      tiebreak: 288,
      countedCodes: ["a", "b", "c"],
      fallbackScore: 91,
      rank: 1,
      split: false
    }
  }];

  const playerScores: PlayerScore[] = [
    buildScore("a", "Alpha", 285, "-3", [74, 70, 70, 71]),
    buildScore("b", "Bravo", 280, "-8", [68, 71, 70, 71]),
    buildScore("c", "Charlie", 289, "+1", [72, 72, 72, 73])
  ];

  it("sorts round result golfer columns by lowest round score first", () => {
    const [row] = buildRoundRows(submissions, golfers, standings, playerScores, 1);

    expect(row?.slots.slice(0, 3).map((slot) => [slot.golfer, slot.score])).toEqual([
      ["Bravo", -4],
      ["Charlie", 0],
      ["Alpha", 2]
    ]);
  });

  it("sorts overall result golfer columns by lowest total score first", () => {
    const [row] = buildOverallRows(submissions, golfers, standings, playerScores);

    expect(row?.slots.slice(0, 3).map((slot) => [slot.golfer, slot.score])).toEqual([
      ["Bravo", -8],
      ["Alpha", -3],
      ["Charlie", 1]
    ]);
  });
});
