import { beforeEach, describe, expect, it } from "vitest";
import { repository } from "@/lib/data/repository";
import { validateSubmissionInput } from "@/lib/validation/submission";
import type { Database } from "@/lib/types";

const baseDb: Database = {
  tournament: {
    id: "masters-pool",
    name: "Masters Pool",
    year: 2025,
    lockTimeIso: "2099-04-10T11:00:00.000Z",
    entryFee: 65,
    payoutPercentages: {
      round1: 12.5,
      round2: 12.5,
      round3: 12.5,
      round4: 12.5,
      final: 50
    },
    viewerPasscode: "secret",
    updatedAt: new Date().toISOString()
  },
  golfers: [
    {
      code: "1",
      name: "Scottie Scheffler",
      odds: 450,
      probability: 0.07,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: "2",
      name: "Rory McIlroy",
      odds: 650,
      probability: 0.04,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: "3",
      name: "Ludvig Aberg",
      odds: 1600,
      probability: 0.03,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      code: "4",
      name: "Inactive Golfer",
      odds: 8000,
      probability: 0.01,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  submissions: [],
  scoreSnapshots: [],
  playerScores: [],
  derivedTeamStandings: []
};

beforeEach(() => {
  repository.updateTournament(baseDb.tournament);
  repository.replaceGolfers(baseDb.golfers);
});

describe("validateSubmissionInput", () => {
  it("accepts a legal team with duplicate golfers", () => {
    const validated = validateSubmissionInput({
      participantName: "Rob",
      email: "rob@example.com",
      venmoHandle: "@rob",
      teamName: "Green Jacket Index",
      picks: ["1", "2", "2"]
    });

    expect(validated.picks).toEqual(["1", "2", "2"]);
    expect(validated.probabilityTotal).toBe(0.15);
  });

  it("rejects fewer than three golfers", () => {
    expect(() =>
      validateSubmissionInput({
        participantName: "Rob",
        email: "rob@example.com",
        teamName: "Tiny Team",
        picks: ["1", "2"]
      })
    ).toThrow(/at least 3 golfers/i);
  });

  it("rejects teams above the probability cap", () => {
    expect(() =>
      validateSubmissionInput({
        participantName: "Rob",
        email: "rob@example.com",
        teamName: "Too Chalky",
        picks: ["1", "1", "2"]
      })
    ).toThrow(/cannot exceed 15.00%/i);
  });

  it("rejects inactive golfers", () => {
    expect(() =>
      validateSubmissionInput({
        participantName: "Rob",
        email: "rob@example.com",
        teamName: "Bad Field",
        picks: ["1", "2", "4"]
      })
    ).toThrow(/not active/i);
  });
});
