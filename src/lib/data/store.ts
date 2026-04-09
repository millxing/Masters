import fs from "node:fs";
import { config } from "@/lib/config";
import { generateUniqueEditCode, isValidEditCode, normalizeEditCode } from "@/lib/edit-codes";
import { syncRosterLedger } from "@/lib/roster-ledger";
import { ensureRuntimeDatabase } from "@/lib/runtime-fixtures";
import { ensureDataDirectory } from "@/lib/seed";
import type { Database, Golfer, PlayerScore, ScoreSnapshot, Submission, TeamStanding, Tournament } from "@/lib/types";

function normalizeSubmission(submission: Submission, existingCodes: Set<string>) {
  let changed = false;
  let editCode = normalizeEditCode(submission.editCode ?? "");

  if (!isValidEditCode(editCode) || existingCodes.has(editCode)) {
    editCode = generateUniqueEditCode(existingCodes);
    changed = true;
  }

  existingCodes.add(editCode);

  return {
    changed,
    submission: {
      ...submission,
      editCode
    }
  };
}

function normalizeDatabase(db: Database) {
  const existingCodes = new Set<string>();
  let changed = false;

  const submissions = db.submissions.map((submission) => {
    const normalized = normalizeSubmission(submission, existingCodes);
    changed ||= normalized.changed || normalized.submission.editCode !== submission.editCode;
    return normalized.submission;
  });

  return {
    changed,
    db: {
      ...db,
      submissions
    }
  };
}

function readDatabase(): Database {
  ensureRuntimeDatabase();
  const rawDb = JSON.parse(fs.readFileSync(config.dbPath, "utf8")) as Database;
  const normalized = normalizeDatabase(rawDb);

  if (normalized.changed) {
    writeDatabase(normalized.db);
  }

  return normalized.db;
}

function writeDatabase(db: Database) {
  ensureDataDirectory();
  fs.writeFileSync(config.dbPath, JSON.stringify(db, null, 2));
  syncRosterLedger(db, config.dbPath);
}

export const store = {
  getDatabase: readDatabase,
  saveDatabase: writeDatabase,
  getTournament(): Tournament {
    return readDatabase().tournament;
  },
  updateTournament(tournament: Tournament) {
    const db = readDatabase();
    db.tournament = tournament;
    writeDatabase(db);
    return tournament;
  },
  listGolfers() {
    return readDatabase().golfers;
  },
  replaceGolfers(golfers: Golfer[]) {
    const db = readDatabase();
    db.golfers = golfers;
    writeDatabase(db);
    return golfers;
  },
  listSubmissions() {
    return readDatabase().submissions;
  },
  saveSubmission(submission: Submission) {
    const db = readDatabase();
    db.submissions.push(submission);
    writeDatabase(db);
    return submission;
  },
  updateSubmission(updated: Submission) {
    const db = readDatabase();
    db.submissions = db.submissions.map((submission) =>
      submission.id === updated.id ? updated : submission
    );
    writeDatabase(db);
    return updated;
  },
  getSubmissionByTokenHash(tokenHash: string) {
    return readDatabase().submissions.find((submission) => submission.editTokenHash === tokenHash) ?? null;
  },
  getSubmissionById(submissionId: string) {
    return readDatabase().submissions.find((submission) => submission.id === submissionId) ?? null;
  },
  getLatestSnapshot() {
    const db = readDatabase();
    return db.scoreSnapshots.at(-1) ?? null;
  },
  getPlayerScoresForSnapshot(snapshotId: string) {
    return readDatabase().playerScores.filter((score) => score.snapshotId === snapshotId);
  },
  replaceScores(snapshot: ScoreSnapshot, playerScores: PlayerScore[]) {
    const db = readDatabase();
    db.scoreSnapshots.push(snapshot);
    db.playerScores = db.playerScores.filter((score) => score.snapshotId !== snapshot.id).concat(playerScores);
    writeDatabase(db);
    return snapshot;
  },
  replaceDerivedStandings(standings: TeamStanding[]) {
    const db = readDatabase();
    db.derivedTeamStandings = standings;
    writeDatabase(db);
    return standings;
  },
  getDerivedStandings() {
    return readDatabase().derivedTeamStandings;
  }
};
