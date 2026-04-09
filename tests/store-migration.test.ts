import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = {
  dbPath: process.env.DB_PATH,
  mode: process.env.MASTERS_MODE,
  runtimeRoot: process.env.MASTERS_RUNTIME_ROOT,
  siteVariant: process.env.SITE_VARIANT
};

afterEach(() => {
  process.env.DB_PATH = originalEnv.dbPath;
  process.env.MASTERS_MODE = originalEnv.mode;
  process.env.MASTERS_RUNTIME_ROOT = originalEnv.runtimeRoot;
  process.env.SITE_VARIANT = originalEnv.siteVariant;
  vi.resetModules();
});

describe("store submission compatibility migration", () => {
  it("backfills missing edit codes and persists them to disk", async () => {
    const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "masters-store-migration-"));
    const dbPath = path.join(runtimeRoot, "legacy.json");
    process.env.DB_PATH = dbPath;
    delete process.env.MASTERS_RUNTIME_ROOT;
    delete process.env.MASTERS_MODE;
    vi.resetModules();

    fs.writeFileSync(
      dbPath,
      JSON.stringify({
        tournament: {
          id: "masters-pool",
          name: "Masters Pool",
          year: 2026,
          lockTimeIso: "2099-04-10T15:00:00.000Z",
          entryFee: 65,
          payoutPercentages: {
            round1: 12.5,
            round2: 12.5,
            round3: 12.5,
            round4: 12.5,
            final: 50
          },
          viewerPasscode: "viewer",
          updatedAt: "2026-04-01T00:00:00.000Z"
        },
        golfers: [],
        submissions: [
          {
            id: "submission_1",
            tournamentId: "masters-pool",
            participantName: "One",
            email: "one@example.com",
            venmoHandle: null,
            teamName: "Alpha",
            picks: ["1", "2", "3"],
            probabilityTotal: 0.1,
            paymentStatus: "pending",
            createdAt: "2026-04-01T00:00:00.000Z",
            updatedAt: "2026-04-01T00:00:00.000Z",
            lockedAt: null
          },
          {
            id: "submission_2",
            tournamentId: "masters-pool",
            participantName: "Two",
            email: "two@example.com",
            venmoHandle: null,
            teamName: "Bravo",
            picks: ["1", "2", "3"],
            probabilityTotal: 0.1,
            paymentStatus: "pending",
            createdAt: "2026-04-01T00:00:00.000Z",
            updatedAt: "2026-04-01T00:00:00.000Z",
            lockedAt: null
          }
        ],
        scoreSnapshots: [],
        playerScores: [],
        derivedTeamStandings: []
      }, null, 2)
    );

    const { repository } = await import("@/lib/data/repository");
    const submissions = repository.listSubmissions();

    expect(submissions).toHaveLength(2);
    expect(submissions[0]?.editCode).toMatch(/^[a-z]{4}$/);
    expect(submissions[1]?.editCode).toMatch(/^[a-z]{4}$/);
    expect(submissions[0]?.editCode).not.toBe(submissions[1]?.editCode);

    const persisted = JSON.parse(fs.readFileSync(dbPath, "utf8")) as {
      submissions: Array<{ editCode?: string }>;
    };
    expect(persisted.submissions.every((submission) => /^[a-z]{4}$/.test(submission.editCode ?? ""))).toBe(true);
  });
});
