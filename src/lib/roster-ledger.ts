import fs from "node:fs";
import path from "node:path";
import { config } from "@/lib/config";
import type { Database } from "@/lib/types";

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

function formatProbability(probability: number) {
  return `${(probability * 100).toFixed(2)}%`;
}

function escapeMarkdown(value: string) {
  return value.replace(/[\\`*_{}\[\]()#+\-.!|>]/g, "\\$&");
}

export function getRosterLedgerPath(dbPath: string) {
  const parsed = path.parse(dbPath);
  return path.join(parsed.dir, `${parsed.name}.rosters.md`);
}

export function buildRosterLedgerMarkdown(db: Database, dbPath: string) {
  const golferMap = new Map(db.golfers.map((golfer) => [golfer.code, golfer.name]));
  const relativeDbPath = path.relative(config.rootDir, dbPath) || dbPath;

  const lines = [
    "# Roster Ledger",
    "",
    "This file is generated automatically from roster submissions.",
    `Source DB: \`${relativeDbPath}\``,
    `Updated: ${formatTimestamp(new Date().toISOString())}`,
    `Tournament: ${db.tournament.year} ${db.tournament.name}`,
    `Lock Time: ${formatTimestamp(db.tournament.lockTimeIso)}`,
    `Submissions: ${db.submissions.length}`,
    ""
  ];

  if (db.submissions.length === 0) {
    lines.push("No rosters submitted yet.", "");
    return lines.join("\n");
  }

  db.submissions.forEach((submission, index) => {
    lines.push(`## ${index + 1}. ${escapeMarkdown(submission.teamName)}`);
    lines.push(`Participant: ${escapeMarkdown(submission.participantName)}`);
    lines.push(`Email: ${escapeMarkdown(submission.email)}`);
    lines.push(`Venmo: ${escapeMarkdown(submission.venmoHandle ?? "--")}`);
    lines.push(`Probability Total: ${formatProbability(submission.probabilityTotal)}`);
    lines.push(`Created: ${formatTimestamp(submission.createdAt)}`);
    lines.push(`Updated: ${formatTimestamp(submission.updatedAt)}`);
    lines.push("");
    lines.push("Picks:");

    submission.picks.forEach((code, pickIndex) => {
      const golferName = golferMap.get(code) ?? "Unknown Golfer";
      lines.push(`${pickIndex + 1}. ${escapeMarkdown(golferName)} (${escapeMarkdown(code)})`);
    });

    lines.push("");
  });

  return lines.join("\n");
}

export function syncRosterLedger(db: Database, dbPath: string) {
  const ledgerPath = getRosterLedgerPath(dbPath);
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.writeFileSync(ledgerPath, buildRosterLedgerMarkdown(db, dbPath));
}
