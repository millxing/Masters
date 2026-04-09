import fs from "node:fs";
import path from "node:path";
import { config } from "@/lib/config";
import type { Database, Golfer, Tournament } from "@/lib/types";
import golferSeed from "@/lib/golfer-seed.json";

function buildSeedGolfers(): Golfer[] {
  const now = new Date().toISOString();

  return golferSeed.map((golfer) => ({
    ...golfer,
    createdAt: now,
    updatedAt: now
  })) satisfies Golfer[];
}

function buildDefaultTournament(): Tournament {
  return {
    id: "masters-pool",
    name: "Masters Pool",
    year: 2026,
    lockTimeIso: config.defaultLockTimeIso,
    entryFee: 75,
    payoutPercentages: {
      round1: 12.5,
      round2: 12.5,
      round3: 12.5,
      round4: 12.5,
      final: 50
    },
    viewerPasscode: config.devViewerPasscode,
    updatedAt: new Date().toISOString()
  };
}

export function buildDefaultDatabase(): Database {
  return {
    tournament: buildDefaultTournament(),
    golfers: buildSeedGolfers(),
    submissions: [],
    scoreSnapshots: [],
    playerScores: [],
    derivedTeamStandings: []
  };
}

export function ensureDataDirectory() {
  fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
}
