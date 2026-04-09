import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as cheerio from "cheerio";

const rootDir = process.cwd();
const dbPath = path.join(rootDir, "data", "db.json");
const env = {
  ...readEnvFile(path.join(rootDir, ".env")),
  ...readEnvFile(path.join(rootDir, ".env.local")),
  ...process.env
};

const tournamentId = getArgValue("--tournament-id") ?? env.ESPN_TOURNAMENT_ID;

if (!tournamentId) {
  console.error("Missing ESPN_TOURNAMENT_ID. Set it in .env.local or pass --tournament-id=<id>.");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const url = `https://www.espn.com/golf/leaderboard/_/tournamentId/${tournamentId}`;
const response = await fetch(url, {
  headers: {
    "user-agent": "masters-pool-bot/1.0"
  }
});

if (!response.ok) {
  throw new Error(`ESPN request failed with status ${response.status}.`);
}

const html = await response.text();
const rows = parseEspnTable(html);

if (rows.length === 0) {
  throw new Error("Unable to parse ESPN leaderboard data.");
}

const golfersByCode = new Map(db.golfers.map((golfer) => [golfer.code, golfer]));
const golfersByName = new Map(db.golfers.map((golfer) => [normalizeName(golfer.name), golfer]));
const unmapped = [];
const playerScores = [];

for (const row of rows) {
  const golfer = (row.code ? golfersByCode.get(row.code) : undefined)
    ?? (row.name ? golfersByName.get(normalizeName(row.name)) : undefined);

  if (!golfer) {
    unmapped.push(row);
    continue;
  }

  playerScores.push({
    snapshotId: "",
    golferCode: golfer.code,
    golferName: golfer.name,
    status: row.status ?? "",
    rounds: [row.r1 ?? null, row.r2 ?? null, row.r3 ?? null, row.r4 ?? null],
    total: row.total ?? null
  });
}

if (playerScores.length === 0) {
  throw new Error("No ESPN golfer rows matched the current golfer pool.");
}

const snapshot = {
  id: createId("snapshot"),
  tournamentId: db.tournament.id,
  source: "espn",
  importedAt: new Date().toISOString(),
  sourceLabel: "ESPN leaderboard",
  rawPayload: JSON.stringify(rows, null, 2)
};

const snapshotScores = playerScores.map((score) => ({
  ...score,
  snapshotId: snapshot.id
}));

db.scoreSnapshots.push(snapshot);
db.playerScores = db.playerScores.filter((score) => score.snapshotId !== snapshot.id).concat(snapshotScores);
db.derivedTeamStandings = deriveTeamStandings(db.submissions, snapshotScores);

fs.writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`);

console.log(`Imported ${snapshotScores.length} golfer score rows from ESPN into ${path.relative(rootDir, dbPath)}.`);
if (unmapped.length > 0) {
  console.log(`Unmapped rows: ${unmapped.length}`);
  for (const row of unmapped.slice(0, 10)) {
    console.log(`- ${row.name ?? "(missing name)"}`);
  }
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    values[key] = stripQuotes(value);
  }

  return values;
}

function stripQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\""))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function getArgValue(flag) {
  const exact = process.argv.find((argument) => argument.startsWith(`${flag}=`));
  if (exact) {
    return exact.slice(flag.length + 1);
  }

  const index = process.argv.findIndex((argument) => argument === flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalizeName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function safeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function cleanPlayerName(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getColumnIndex(headings, label) {
  return headings.findIndex((heading) => heading === label);
}

function readCell(cells, index) {
  return index >= 0 ? cells[index] ?? "" : "";
}

function parseEspnTable(html) {
  const $ = cheerio.load(html);
  const rows = [];
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

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function stableSortBy(items, comparator) {
  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const result = comparator(left.item, right.item);
      return result !== 0 ? result : left.index - right.index;
    })
    .map(({ item }) => item);
}

function buildRoundValues(scoresByCode, roundIndex) {
  const rawRoundScores = Array.from(scoresByCode.values())
    .map((score) => score.rounds[roundIndex])
    .filter((value) => typeof value === "number");

  return {
    fallback: (rawRoundScores.length > 0 ? Math.max(...rawRoundScores) : 90) + 1
  };
}

function scoreRound(submission, scoresByCode, roundIndex) {
  const { fallback } = buildRoundValues(scoresByCode, roundIndex);
  const scoredSlots = submission.picks.map((code) => {
    const playerScore = scoresByCode.get(code);
    const roundValue = playerScore?.rounds[roundIndex];

    return {
      code,
      value: typeof roundValue === "number" ? roundValue : fallback
    };
  });

  const sorted = stableSortBy(scoredSlots, (a, b) => a.value - b.value);
  const counted = sorted.slice(0, 3);

  return {
    score: counted.reduce((sum, item) => sum + item.value, 0),
    tiebreak: sorted[3]?.value ?? fallback,
    countedCodes: counted.map((item) => item.code),
    fallbackScore: fallback
  };
}

function scoreFinal(submission, scoresByCode) {
  const fallbackPerRound = [0, 1, 2, 3].map((roundIndex) => buildRoundValues(scoresByCode, roundIndex).fallback);
  const slotTotals = submission.picks.map((code) => {
    const playerScore = scoresByCode.get(code);
    const total = [0, 1, 2, 3].reduce((sum, roundIndex) => {
      const roundValue = playerScore?.rounds[roundIndex];
      return sum + (typeof roundValue === "number" ? roundValue : fallbackPerRound[roundIndex]);
    }, 0);

    return { code, value: total };
  });

  const sorted = stableSortBy(slotTotals, (a, b) => a.value - b.value);
  const counted = sorted.slice(0, 3);
  const fallback = Math.max(...slotTotals.map((slot) => slot.value), 300) + 1;

  return {
    score: counted.reduce((sum, item) => sum + item.value, 0),
    tiebreak: sorted[3]?.value ?? fallback,
    countedCodes: counted.map((item) => item.code),
    fallbackScore: fallback
  };
}

function rankMetrics(metrics) {
  const sorted = stableSortBy(
    metrics.map((metric, originalIndex) => ({ metric, originalIndex })),
    (a, b) => {
      if (a.metric.score !== b.metric.score) {
        return a.metric.score - b.metric.score;
      }

      return a.metric.tiebreak - b.metric.tiebreak;
    }
  );

  let lastRank = 0;

  const ranked = sorted.map((entry, index) => {
    const previous = sorted[index - 1];
    const sameAsPrevious = previous
      && previous.metric.score === entry.metric.score
      && previous.metric.tiebreak === entry.metric.tiebreak;

    const rank = sameAsPrevious ? lastRank : index + 1;
    lastRank = rank;

    const split = sorted.some(
      (candidate) =>
        candidate.originalIndex !== entry.originalIndex
        && candidate.metric.score === entry.metric.score
        && candidate.metric.tiebreak === entry.metric.tiebreak
    );

    return {
      ...entry.metric,
      originalIndex: entry.originalIndex,
      rank,
      split
    };
  });

  return stableSortBy(ranked, (a, b) => a.originalIndex - b.originalIndex).map(
    ({ originalIndex, ...entry }) => entry
  );
}

function deriveTeamStandings(submissions, scores) {
  const scoresByCode = new Map(scores.map((score) => [score.golferCode, score]));
  const unranked = submissions.map((submission) => {
    const rounds = [0, 1, 2, 3].map((roundIndex) => scoreRound(submission, scoresByCode, roundIndex));
    const final = scoreFinal(submission, scoresByCode);

    return {
      submissionId: submission.id,
      teamName: submission.teamName,
      participantName: submission.participantName,
      picks: submission.picks,
      probabilityTotal: submission.probabilityTotal,
      rounds,
      final
    };
  });

  const roundRanks = [0, 1, 2, 3].map((roundIndex) =>
    rankMetrics(unranked.map((standing) => standing.rounds[roundIndex]))
  );
  const finalRanks = rankMetrics(unranked.map((standing) => standing.final));

  return unranked.map((standing, standingIndex) => ({
    ...standing,
    rounds: standing.rounds.map((round, roundIndex) => ({
      round: roundIndex + 1,
      ...round,
      rank: roundRanks[roundIndex][standingIndex].rank,
      split: roundRanks[roundIndex][standingIndex].split
    })),
    final: {
      ...standing.final,
      rank: finalRanks[standingIndex].rank,
      split: finalRanks[standingIndex].split
    }
  }));
}
