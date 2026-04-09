import Papa from "papaparse";
import { repository } from "@/lib/data/repository";
import type { Golfer, PlayerScore, ScoreImportRow, ScoreSnapshot, ScoreSource } from "@/lib/types";
import { safeNumber } from "@/lib/utils";
import { createId } from "@/lib/server-utils";

export function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function parseCsvImport(csvText: string): ScoreImportRow[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? "Could not parse CSV.");
  }

  return parsed.data.map((row) => ({
    code: row.code || row.golfer_code || row.golferCode || undefined,
    name: row.name || row.golfer || row.player || undefined,
    position: row.position || row.pos || undefined,
    status: row.status || "",
    thru: row.thru || row.hole || undefined,
    r1: safeNumber(row.r1),
    r2: safeNumber(row.r2),
    r3: safeNumber(row.r3),
    r4: safeNumber(row.r4),
    total: safeNumber(row.total)
  }));
}

function mapRowsToScores(rows: ScoreImportRow[], golfers: Golfer[]) {
  const golfersByCode = new Map(golfers.map((golfer) => [golfer.code, golfer]));
  const golfersByName = new Map(golfers.map((golfer) => [normalizeName(golfer.name), golfer]));

  const unmapped: ScoreImportRow[] = [];
  const playerScores: PlayerScore[] = [];

  for (const row of rows) {
    const byCode = row.code ? golfersByCode.get(row.code) : undefined;
    const byName = row.name ? golfersByName.get(normalizeName(row.name)) : undefined;
    const golfer = byCode ?? byName;

    if (!golfer) {
      unmapped.push(row);
      continue;
    }

    playerScores.push({
      snapshotId: "",
      golferCode: golfer.code,
      golferName: golfer.name,
      position: row.position ?? "",
      thru: row.thru ?? "",
      status: row.status ?? "",
      rounds: [row.r1 ?? null, row.r2 ?? null, row.r3 ?? null, row.r4 ?? null],
      total: row.total ?? null
    });
  }

  return { playerScores, unmapped };
}

export function importScores(rows: ScoreImportRow[], source: ScoreSource, sourceLabel: string) {
  const golfers = repository.listGolfers();
  const { playerScores, unmapped } = mapRowsToScores(rows, golfers);

  if (playerScores.length === 0) {
    throw new Error("No golfer rows matched the current golfer pool.");
  }

  const snapshot: ScoreSnapshot = {
    id: createId("snapshot"),
    tournamentId: repository.getTournament().id,
    source,
    importedAt: new Date().toISOString(),
    sourceLabel,
    rawPayload: JSON.stringify(rows, null, 2)
  };

  const snapshotScores = playerScores.map((score) => ({
    ...score,
    snapshotId: snapshot.id
  }));

  repository.replaceScores(snapshot, snapshotScores);

  return {
    snapshot,
    playerScores: snapshotScores,
    unmapped
  };
}
