import * as cheerio from "cheerio";
import { config } from "@/lib/config";
import type { ScoreImportRow } from "@/lib/types";
import { safeNumber } from "@/lib/utils";

export interface ScoreProvider {
  fetchLatestScores(): Promise<ScoreImportRow[]>;
}

function cleanPlayerName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getColumnIndex(headings: string[], label: string) {
  return headings.findIndex((heading) => heading === label);
}

function readCell(cells: string[], index: number) {
  return index >= 0 ? cells[index] ?? "" : "";
}

export function parseTable(html: string): ScoreImportRow[] {
  const $ = cheerio.load(html);
  const rows: ScoreImportRow[] = [];
  const table = $("table").filter((_, element) => {
    const headings = $(element)
      .find("thead th")
      .map((__, th) => $(th).text().trim().toUpperCase())
      .get();

    return headings.includes("PLAYER") && headings.includes("R1");
  }).first();

  const headings = table
    .find("thead th")
    .map((_, th) => $(th).text().trim().toUpperCase())
    .get();

  const playerIndex = getColumnIndex(headings, "PLAYER");
  const scoreIndex = getColumnIndex(headings, "SCORE");
  const r1Index = getColumnIndex(headings, "R1");
  const r2Index = getColumnIndex(headings, "R2");
  const r3Index = getColumnIndex(headings, "R3");
  const r4Index = getColumnIndex(headings, "R4");
  const totalIndex = getColumnIndex(headings, "TOT");

  table.find("tbody tr").each((_, row) => {
    const cells = $(row)
      .find("td")
      .map((__, cell) => $(cell).text().trim())
      .get();

    if (cells.length === 0) {
      return;
    }

    const name = cleanPlayerName(readCell(cells, playerIndex));
    if (!name) {
      return;
    }

    rows.push({
      name,
      status: readCell(cells, scoreIndex),
      r1: safeNumber(readCell(cells, r1Index)),
      r2: safeNumber(readCell(cells, r2Index)),
      r3: safeNumber(readCell(cells, r3Index)),
      r4: safeNumber(readCell(cells, r4Index)),
      total: safeNumber(readCell(cells, totalIndex))
    });
  });

  return rows;
}

export class EspnScoreProvider implements ScoreProvider {
  async fetchLatestScores(): Promise<ScoreImportRow[]> {
    if (!config.espnTournamentId) {
      throw new Error("ESPN_TOURNAMENT_ID is not configured.");
    }

    const response = await fetch(
      `https://www.espn.com/golf/leaderboard/_/tournamentId/${config.espnTournamentId}`,
      {
        headers: {
          "user-agent": "masters-pool-bot/1.0"
        },
        next: { revalidate: 0 }
      }
    );

    if (!response.ok) {
      throw new Error(`ESPN request failed with status ${response.status}.`);
    }

    const html = await response.text();
    const rows = parseTable(html);

    if (rows.length === 0) {
      throw new Error("Unable to parse ESPN leaderboard data.");
    }

    return rows;
  }
}
