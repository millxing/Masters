import { describe, expect, it } from "vitest";
import { deriveTeamStandings } from "@/lib/scoring/engine";
import type { PlayerScore, Submission } from "@/lib/types";

function buildSubmission(id: string, picks: string[]): Submission {
  return {
    id,
    tournamentId: "masters-pool",
    participantName: `Player ${id}`,
    email: `${id}@example.com`,
    venmoHandle: null,
    teamName: `Team ${id}`,
    picks,
    probabilityTotal: 0.1,
    paymentStatus: "pending",
    editCode: `code${id}`.slice(0, 4),
    editTokenHash: `hash-${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lockedAt: null
  };
}

function buildScore(code: string, rounds: Array<number | null>): PlayerScore {
  return {
    snapshotId: "snapshot_1",
    golferCode: code,
    golferName: code,
    status: "",
    rounds,
    total: null
  };
}

describe("deriveTeamStandings", () => {
  it("scores each round using the best three golfers", () => {
    const standings = deriveTeamStandings(
      [buildSubmission("a", ["1", "2", "3", "4"])],
      [
        buildScore("1", [70, 71, 72, 73]),
        buildScore("2", [69, 72, 71, 74]),
        buildScore("3", [68, 70, 74, 75]),
        buildScore("4", [80, 80, 80, 80])
      ]
    );

    expect(standings[0]?.rounds[0]?.score).toBe(207);
    expect(standings[0]?.rounds[0]?.tiebreak).toBe(80);
    expect(standings[0]?.final.score).toBe(859);
  });

  it("assigns highest-round-plus-one penalties to missing round scores", () => {
    const standings = deriveTeamStandings(
      [buildSubmission("a", ["1", "2", "3"])],
      [
        buildScore("1", [70, 71, 72, 73]),
        buildScore("2", [69, null, 71, 72]),
        buildScore("3", [68, 70, 74, 75]),
        buildScore("4", [83, 82, 81, 80])
      ]
    );

    expect(standings[0]?.rounds[1]?.score).toBe(71 + 70 + 83);
    expect(standings[0]?.rounds[1]?.tiebreak).toBe(83);
  });

  it("keeps duplicate golfer picks as separate scoring slots", () => {
    const standings = deriveTeamStandings(
      [buildSubmission("a", ["1", "1", "2"])],
      [buildScore("1", [70, 70, 70, 70]), buildScore("2", [69, 69, 69, 69])]
    );

    expect(standings[0]?.rounds[0]?.score).toBe(209);
    expect(standings[0]?.final.score).toBe(836);
  });

  it("marks exact post-tiebreak ties as split results", () => {
    const standings = deriveTeamStandings(
      [
        buildSubmission("a", ["1", "2", "3", "4"]),
        buildSubmission("b", ["1", "2", "3", "4"])
      ],
      [
        buildScore("1", [70, 70, 70, 70]),
        buildScore("2", [71, 71, 71, 71]),
        buildScore("3", [72, 72, 72, 72]),
        buildScore("4", [73, 73, 73, 73])
      ]
    );

    expect(standings[0]?.final.rank).toBe(1);
    expect(standings[1]?.final.rank).toBe(1);
    expect(standings[0]?.final.split).toBe(true);
    expect(standings[1]?.final.split).toBe(true);
  });

  it("assigns ranks back to the original submissions after sorting", () => {
    const standings = deriveTeamStandings(
      [
        buildSubmission("a", ["1", "2", "3"]),
        buildSubmission("b", ["4", "5", "6"])
      ],
      [
        buildScore("1", [80, 80, 80, 80]),
        buildScore("2", [80, 80, 80, 80]),
        buildScore("3", [80, 80, 80, 80]),
        buildScore("4", [70, 70, 70, 70]),
        buildScore("5", [70, 70, 70, 70]),
        buildScore("6", [70, 70, 70, 70])
      ]
    );

    expect(standings[0]?.final.score).toBe(960);
    expect(standings[0]?.final.rank).toBe(2);
    expect(standings[1]?.final.score).toBe(840);
    expect(standings[1]?.final.rank).toBe(1);
  });
});
