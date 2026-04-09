import fs from "node:fs";
import path from "node:path";
import replay2025FixtureJson from "../../data/db.json";
import { config } from "@/lib/config";
import {
  getAppModeDefinition,
  getDefaultPresetForMode,
  getFixturePresetDefinition,
  listFixturePresetsForMode,
  type AppMode,
  type FixturePresetId
} from "@/lib/app-mode";
import { getRosterLedgerPath, syncRosterLedger } from "@/lib/roster-ledger";
import { deriveTeamStandings } from "@/lib/scoring/engine";
import { buildDefaultDatabase, ensureDataDirectory } from "@/lib/seed";
import type { Database, PlayerScore, ScoreSnapshot } from "@/lib/types";

const replay2025Fixture = replay2025FixtureJson as Database;

function cloneDatabase<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatToPar(value: number) {
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : `${value}`;
}

function buildReplayDatabase() {
  return cloneDatabase(replay2025Fixture);
}

function withLockTime(db: Database, lockTimeIso: string) {
  db.tournament.lockTimeIso = lockTimeIso;
  db.tournament.updatedAt = new Date().toISOString();
  return db;
}

function buildRosterSandboxDatabase(lockState: "open" | "locked") {
  const db = buildDefaultDatabase();
  db.tournament.name = "Masters Pool";
  db.tournament.updatedAt = new Date().toISOString();
  return withLockTime(
    db,
    lockState === "open" ? new Date("2099-04-10T15:00:00.000Z").toISOString() : new Date("2000-04-10T15:00:00.000Z").toISOString()
  );
}

function buildStageStatus(score: PlayerScore, completedRounds: number, total: number | null) {
  if (completedRounds === 4) {
    return score.status;
  }

  if (completedRounds >= 2 && score.status === "CUT") {
    return "CUT";
  }

  return typeof total === "number" ? formatToPar(total - completedRounds * 72) : "";
}

function buildStageScore(score: PlayerScore, completedRounds: number): PlayerScore {
  const rounds = score.rounds.map((round, roundIndex) =>
    roundIndex < completedRounds ? round : null
  ) as Array<number | null>;
  const numericRounds = rounds.filter((round): round is number => typeof round === "number");
  const total = numericRounds.length > 0 ? numericRounds.reduce((sum, round) => sum + round, 0) : null;

  return {
    ...score,
    rounds,
    total,
    status: buildStageStatus(score, completedRounds, total)
  };
}

function buildSnapshot(scores: PlayerScore[], id: string, label: string, importedAt: string): ScoreSnapshot {
  return {
    id,
    tournamentId: replay2025Fixture.tournament.id,
    source: "manual",
    importedAt,
    sourceLabel: label,
    rawPayload: JSON.stringify(scores, null, 2)
  };
}

function buildLeaderboardSandboxDatabase(completedRounds: 1 | 2 | 3 | 4) {
  const db = buildReplayDatabase();
  const snapshotId = `snapshot_leaderboard_${completedRounds}`;
  const playerScores: PlayerScore[] = db.playerScores.map((score) => ({
    ...buildStageScore(score, completedRounds),
    snapshotId
  }));

  const sourceLabel =
    completedRounds === 1
      ? "Leaderboard sandbox: round 1"
      : completedRounds === 2
        ? "Leaderboard sandbox: after cut"
        : completedRounds === 3
          ? "Leaderboard sandbox: round 3"
          : "Leaderboard sandbox: final";

  db.tournament.name = "Masters Pool Leaderboard Sandbox";
  db.tournament.updatedAt = new Date().toISOString();
  db.scoreSnapshots = [
    buildSnapshot(
      playerScores,
      snapshotId,
      sourceLabel,
      new Date(`2025-04-${10 + completedRounds}T22:00:00.000Z`).toISOString()
    )
  ];
  db.playerScores = playerScores;
  db.derivedTeamStandings = deriveTeamStandings(db.submissions, playerScores);

  return db;
}

export function buildDatabaseForPreset(presetId: FixturePresetId): Database {
  switch (presetId) {
    case "replay2025-reset":
      return buildReplayDatabase();
    case "roster-empty-open":
      return buildRosterSandboxDatabase("open");
    case "roster-empty-locked":
      return buildRosterSandboxDatabase("locked");
    case "leaderboard-round1":
      return buildLeaderboardSandboxDatabase(1);
    case "leaderboard-cut":
      return buildLeaderboardSandboxDatabase(2);
    case "leaderboard-round3":
      return buildLeaderboardSandboxDatabase(3);
    case "leaderboard-final":
      return buildLeaderboardSandboxDatabase(4);
  }
}

export function buildInitialDatabaseForMode(mode: AppMode) {
  const defaultPresetId = getDefaultPresetForMode(mode);
  if (defaultPresetId) {
    return buildDatabaseForPreset(defaultPresetId);
  }

  const db = buildDefaultDatabase();
  db.tournament.name = "Masters Pool Live";
  db.tournament.updatedAt = new Date().toISOString();
  return db;
}

export function ensureRuntimeDatabase() {
  ensureDataDirectory();

  if (!fs.existsSync(config.dbPath)) {
    const db = buildInitialDatabaseForMode(config.appMode);
    fs.writeFileSync(config.dbPath, JSON.stringify(db, null, 2));
    syncRosterLedger(db, config.dbPath);
    return;
  }

  const rosterLedgerPath = getRosterLedgerPath(config.dbPath);
  if (!fs.existsSync(rosterLedgerPath)) {
    const db = JSON.parse(fs.readFileSync(config.dbPath, "utf8")) as Database;
    syncRosterLedger(db, config.dbPath);
  }
}

export function loadPresetIntoRuntime(presetId: FixturePresetId) {
  const preset = getFixturePresetDefinition(presetId);
  const mode = config.appMode;
  const modeDefinition = getAppModeDefinition(mode);

  if (!modeDefinition.allowsFixtureActions) {
    throw new Error("Fixture loads are disabled in live mode.");
  }

  if (preset.mode !== mode) {
    throw new Error(`${preset.label} is not available in ${modeDefinition.label}.`);
  }

  ensureDataDirectory();
  const db = buildDatabaseForPreset(presetId);
  fs.writeFileSync(config.dbPath, JSON.stringify(db, null, 2));
  syncRosterLedger(db, config.dbPath);

  return { preset, mode: modeDefinition };
}

export function resetRuntimeForCurrentMode() {
  const modeDefinition = getAppModeDefinition(config.appMode);

  if (!modeDefinition.allowsFixtureActions) {
    throw new Error("Fixture loads are disabled in live mode.");
  }

  const defaultPresetId = getDefaultPresetForMode(config.appMode);

  if (!defaultPresetId) {
    throw new Error("This mode does not have a reset fixture.");
  }

  return loadPresetIntoRuntime(defaultPresetId);
}

export function listAvailablePresetsForCurrentMode() {
  return listFixturePresetsForMode(config.appMode);
}

export function getRuntimePathLabel(runtimePath: string) {
  return path.relative(config.rootDir, runtimePath) || runtimePath;
}
