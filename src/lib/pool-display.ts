import type { Golfer, PlayerScore, Submission, TeamStanding } from "@/lib/types";

export type RosterDisplayRow = {
  teamNumber: number;
  teamName: string;
  captain: string;
  initials: string;
  golfers: string[];
};

export type RoundDisplayRow = {
  teamNumber: number;
  teamName: string;
  captain: string;
  initials: string;
  slots: Array<{
    golfer: string;
    score: number | string;
  }>;
  teamScore: number | string;
};

export type GolferScoreboardRow = {
  golferCode: string;
  order: number;
  position: string;
  positionValue: number;
  golferName: string;
  score: string;
  scoreValue: number;
  hole: string;
  holeValue: number;
  rounds: Array<number | string>;
  roundValues: number[];
  total: number | string;
  totalValue: number;
};

const maxSlots = 8;
const emptySlotLabel = "No Player";
const roundPar = 72;
const totalPar = roundPar * 4;
const teamRoundPar = roundPar * 3;
const teamTotalPar = totalPar * 3;

function padPicks(picks: string[]) {
  return [...picks, ...Array.from({ length: maxSlots - picks.length }, () => "0")].slice(0, maxSlots);
}

function buildRoundFallback(playerScores: PlayerScore[], roundIndex: number) {
  const rawRoundScores = playerScores
    .map((score) => score.rounds[roundIndex])
    .filter((value): value is number => typeof value === "number");

  return (rawRoundScores.length > 0 ? Math.max(...rawRoundScores) : 90) + 1;
}

function formatRelative(rawScore: number, par: number) {
  return rawScore - par;
}

function formatToPar(value: number) {
  if (value === 0) return "E";
  return value > 0 ? `+${value}` : `${value}`;
}

function getScoreDisplay(score: PlayerScore) {
  if (score.status) {
    return score.status;
  }

  if (typeof score.total !== "number") {
    return "";
  }

  const completedRounds = score.rounds.filter((round): round is number => typeof round === "number").length;
  return completedRounds > 0 ? formatToPar(score.total - completedRounds * roundPar) : "";
}

function getScoreSortValue(score: PlayerScore, effectiveTotal: number, completedRounds: number, worstScoreToPar: number) {
  if (score.status === "CUT") {
    return effectiveTotal - totalPar;
  }

  if (completedRounds === 0) {
    const liveToPar = parseToParValue(score.status);
    if (Number.isFinite(liveToPar)) {
      return liveToPar;
    }
  }

  if (typeof score.total === "number" && completedRounds > 0) {
    return score.total - completedRounds * roundPar;
  }

  return worstScoreToPar + 1;
}

function parseToParValue(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return Number.POSITIVE_INFINITY;
  if (trimmed === "E") return 0;
  if (/^[+-]?\d+$/.test(trimmed)) return Number(trimmed);
  return Number.POSITIVE_INFINITY;
}

function parsePositionValue(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return Number.POSITIVE_INFINITY;
  if (trimmed === "CUT") return Number.POSITIVE_INFINITY;
  const numeric = trimmed.replace(/^T/, "");
  return /^\d+$/.test(numeric) ? Number(numeric) : Number.POSITIVE_INFINITY;
}

function parseThruValue(value: string) {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed || trimmed === "-") return Number.POSITIVE_INFINITY;
  if (trimmed === "F") return 18;
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.POSITIVE_INFINITY;
}

export function getParticipantInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "--";
}

export function buildRosterRows(submissions: Submission[], golfers: Golfer[]): RosterDisplayRow[] {
  const golferMap = new Map(golfers.map((golfer) => [golfer.code, golfer.name]));

  return submissions
    .map((submission, index) => ({
      teamNumber: index + 1,
      teamName: submission.teamName,
      captain: submission.participantName,
      initials: getParticipantInitials(submission.participantName),
      golfers: padPicks(submission.picks).map((code) => golferMap.get(code) ?? emptySlotLabel)
    }))
    .sort((left, right) => left.teamName.localeCompare(right.teamName));
}

export function buildRoundRows(
  submissions: Submission[],
  golfers: Golfer[],
  standings: TeamStanding[],
  playerScores: PlayerScore[],
  roundNumber: 1 | 2 | 3 | 4
): RoundDisplayRow[] {
  const roundIndex = roundNumber - 1;
  const golferMap = new Map(golfers.map((golfer) => [golfer.code, golfer.name]));
  const standingsBySubmissionId = new Map(standings.map((standing) => [standing.submissionId, standing]));
  const scoreMap = new Map(playerScores.map((score) => [score.golferCode, score]));
  const fallback = buildRoundFallback(playerScores, roundIndex);

  const rows = submissions.map((submission, index) => {
    const standing = standingsBySubmissionId.get(submission.id);
    const roundStanding = standing?.rounds.find((round) => round.round === roundNumber);

    return {
      teamNumber: index + 1,
      teamName: submission.teamName,
      captain: submission.participantName,
      initials: getParticipantInitials(submission.participantName),
      slots: padPicks(submission.picks).map((code) => {
        const playerScore = scoreMap.get(code);
        const rawScore =
          code === "0"
            ? fallback
            : typeof playerScore?.rounds[roundIndex] === "number"
              ? playerScore.rounds[roundIndex]
              : fallback;

        return {
          golfer: golferMap.get(code) ?? emptySlotLabel,
          score: formatRelative(rawScore, roundPar)
        };
      }),
      teamScore:
        typeof roundStanding?.score === "number"
          ? formatRelative(roundStanding.score, teamRoundPar)
          : ""
    };
  });

  return rows.sort((left, right) => {
    const leftScore = typeof left.teamScore === "number" ? left.teamScore : Number.POSITIVE_INFINITY;
    const rightScore = typeof right.teamScore === "number" ? right.teamScore : Number.POSITIVE_INFINITY;

    if (leftScore !== rightScore) return leftScore - rightScore;
    return left.teamName.localeCompare(right.teamName);
  });
}

export function buildOverallRows(
  submissions: Submission[],
  golfers: Golfer[],
  standings: TeamStanding[],
  playerScores: PlayerScore[]
): RoundDisplayRow[] {
  const golferMap = new Map(golfers.map((golfer) => [golfer.code, golfer.name]));
  const standingsBySubmissionId = new Map(standings.map((standing) => [standing.submissionId, standing]));
  const scoreMap = new Map(playerScores.map((score) => [score.golferCode, score]));
  const fallbackPerRound = [0, 1, 2, 3].map((roundIndex) => buildRoundFallback(playerScores, roundIndex));

  const rows = submissions.map((submission, index) => {
    const standing = standingsBySubmissionId.get(submission.id);

    return {
      teamNumber: index + 1,
      teamName: submission.teamName,
      captain: submission.participantName,
      initials: getParticipantInitials(submission.participantName),
      slots: padPicks(submission.picks).map((code) => {
        const playerScore = scoreMap.get(code);
        const rawScore = [0, 1, 2, 3].reduce((sum, roundIndex) => {
          const roundScore =
            code === "0"
              ? fallbackPerRound[roundIndex]
              : typeof playerScore?.rounds[roundIndex] === "number"
                ? playerScore.rounds[roundIndex]
                : fallbackPerRound[roundIndex];

          return sum + roundScore;
        }, 0);

        return {
          golfer: golferMap.get(code) ?? emptySlotLabel,
          score: formatRelative(rawScore, totalPar)
        };
      }),
      teamScore:
        typeof standing?.final.score === "number"
          ? formatRelative(standing.final.score, teamTotalPar)
          : ""
    };
  });

  return rows.sort((left, right) => {
    const leftScore = typeof left.teamScore === "number" ? left.teamScore : Number.POSITIVE_INFINITY;
    const rightScore = typeof right.teamScore === "number" ? right.teamScore : Number.POSITIVE_INFINITY;

    if (leftScore !== rightScore) return leftScore - rightScore;
    return left.teamName.localeCompare(right.teamName);
  });
}

export function buildGolferScoreboardRows(playerScores: PlayerScore[]): GolferScoreboardRow[] {
  const fallbackPerRound = [0, 1, 2, 3].map((roundIndex) => buildRoundFallback(playerScores, roundIndex));
  const numericScoreToPar = playerScores
    .map((score) => {
      const completedRounds = score.rounds.filter((round): round is number => typeof round === "number").length;
      return typeof score.total === "number" && completedRounds > 0 ? score.total - completedRounds * roundPar : null;
    })
    .filter((value): value is number => typeof value === "number");
  const worstScoreToPar = numericScoreToPar.length > 0 ? Math.max(...numericScoreToPar) : 0;

  const ordered = [...playerScores].sort((left, right) => {
    const leftTotal = left.rounds.reduce<number>(
      (sum, round, roundIndex) => sum + (typeof round === "number" ? round : fallbackPerRound[roundIndex]),
      0
    );
    const rightTotal = right.rounds.reduce<number>(
      (sum, round, roundIndex) => sum + (typeof round === "number" ? round : fallbackPerRound[roundIndex]),
      0
    );

    if (leftTotal !== rightTotal) return leftTotal - rightTotal;
    return left.golferName.localeCompare(right.golferName);
  });

  const totalCounts = new Map<number, number>();
  for (const score of ordered) {
    if (typeof score.total === "number") {
      totalCounts.set(score.total, (totalCounts.get(score.total) ?? 0) + 1);
    }
  }

  let nextRank = 1;
  let previousTotal: number | null = null;
  let previousRank = 0;

  return ordered.map((score, index) => {
    let position = score.position?.trim() ?? "";
    let positionValue = parsePositionValue(position);
    const roundValues = score.rounds.map((round, roundIndex) =>
      typeof round === "number" ? round : fallbackPerRound[roundIndex]
    );
    const effectiveTotal = roundValues.reduce((sum, round) => sum + round, 0);
    const completedRounds = score.rounds.filter((round): round is number => typeof round === "number").length;

    if (!position && typeof score.total === "number") {
      if (score.total !== previousTotal) {
        previousRank = nextRank;
        previousTotal = score.total;
      }

      position = totalCounts.get(score.total)! > 1 ? `T${previousRank}` : `${previousRank}`;
      positionValue = previousRank;
      nextRank += 1;
    }

    return {
      golferCode: score.golferCode,
      order: index,
      position,
      positionValue,
      golferName: score.golferName,
      score: getScoreDisplay(score),
      scoreValue: getScoreSortValue(score, effectiveTotal, completedRounds, worstScoreToPar),
      hole: score.thru?.trim() || "-",
      holeValue: parseThruValue(score.thru ?? ""),
      rounds: score.rounds.map((round) => round ?? "—"),
      roundValues,
      total: score.total ?? "—",
      totalValue: effectiveTotal
    };
  });
}
