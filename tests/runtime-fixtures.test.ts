import replay2025Fixture from "../data/db.json";
import { describe, expect, it } from "vitest";
import { buildOverallRows, buildRoundRows, buildGolferScoreboardRows } from "@/lib/pool-display";
import { buildDatabaseForPreset, buildInitialDatabaseForMode } from "@/lib/runtime-fixtures";

describe("runtime fixtures", () => {
  it("restores the canonical 2025 replay dataset exactly", () => {
    expect(buildInitialDatabaseForMode("replay2025")).toEqual(replay2025Fixture);
  });

  it("builds a 2026 roster sandbox from the current golfer seed", () => {
    const db = buildInitialDatabaseForMode("rosterSandbox");

    expect(db.tournament.year).toBe(2026);
    expect(db.submissions).toHaveLength(0);
    expect(db.golfers).toHaveLength(90);
    expect(db.golfers[0]).toMatchObject({
      code: "1",
      name: "Scottie Scheffler",
      odds: 410,
      probability: 0.1407
    });
  });

  it("builds a round-1 leaderboard sandbox with only first-round scores", () => {
    const db = buildDatabaseForPreset("leaderboard-round1");
    const scoreboardRows = buildGolferScoreboardRows(db.playerScores);
    const roundRows = buildRoundRows(
      db.submissions,
      db.golfers,
      db.derivedTeamStandings,
      db.playerScores,
      1
    );

    expect(db.playerScores.every((score) => score.rounds[1] === null && score.rounds[2] === null && score.rounds[3] === null)).toBe(true);
    expect(scoreboardRows[0]?.rounds[0]).not.toBe("");
    expect(scoreboardRows[0]?.rounds[1]).toBe("—");
    expect(roundRows).toHaveLength(db.submissions.length);
  });

  it("builds an after-cut sandbox that preserves CUT statuses", () => {
    const db = buildDatabaseForPreset("leaderboard-cut");
    const scoreboardRows = buildGolferScoreboardRows(db.playerScores);

    expect(db.playerScores.some((score) => score.status === "CUT")).toBe(true);
    expect(db.playerScores.every((score) => score.rounds[2] === null && score.rounds[3] === null)).toBe(true);
    expect(scoreboardRows.some((row) => row.score === "CUT")).toBe(true);
  });

  it("builds a final leaderboard sandbox with populated overall results", () => {
    const db = buildDatabaseForPreset("leaderboard-final");
    const overallRows = buildOverallRows(db.submissions, db.golfers, db.derivedTeamStandings, db.playerScores);

    expect(db.scoreSnapshots[0]?.sourceLabel).toMatch(/final/i);
    expect(overallRows).toHaveLength(db.submissions.length);
    expect(typeof overallRows[0]?.teamScore).toBe("number");
  });
});
