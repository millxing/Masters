import type { PlayerScore, Submission, TeamStanding } from "@/lib/types";
import { stableSortBy } from "@/lib/utils";

type RoundMetric = {
  score: number;
  tiebreak: number;
  countedCodes: string[];
  fallbackScore: number;
};

type RankedMetric = RoundMetric & {
  rank: number;
  split: boolean;
};

function findPlayerScore(scoresByCode: Map<string, PlayerScore>, code: string) {
  return scoresByCode.get(code);
}

function buildRoundValues(scoresByCode: Map<string, PlayerScore>, roundIndex: number) {
  const rawRoundScores = Array.from(scoresByCode.values())
    .map((score) => score.rounds[roundIndex])
    .filter((value): value is number => typeof value === "number");

  const fallback = (rawRoundScores.length > 0 ? Math.max(...rawRoundScores) : 90) + 1;

  return { fallback };
}

function scoreRound(submission: Submission, scoresByCode: Map<string, PlayerScore>, roundIndex: number): RoundMetric {
  const { fallback } = buildRoundValues(scoresByCode, roundIndex);
  const scoredSlots = submission.picks.map((code) => {
    const playerScore = findPlayerScore(scoresByCode, code);
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

function scoreFinal(submission: Submission, scoresByCode: Map<string, PlayerScore>): RoundMetric {
  const fallbackPerRound = [0, 1, 2, 3].map((roundIndex) => buildRoundValues(scoresByCode, roundIndex).fallback);
  const slotTotals = submission.picks.map((code) => {
    const playerScore = findPlayerScore(scoresByCode, code);
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

function rankMetrics<T extends RoundMetric>(metrics: T[]): RankedMetric[] {
  const sorted = stableSortBy(
    metrics.map((metric, originalIndex) => ({ metric, originalIndex })),
    (a, b) => {
      if (a.metric.score !== b.metric.score) return a.metric.score - b.metric.score;
      return a.metric.tiebreak - b.metric.tiebreak;
    }
  );

  let lastRank = 0;

  const ranked = sorted.map((entry, index) => {
    const previous = sorted[index - 1];
    const sameAsPrevious =
      previous &&
      previous.metric.score === entry.metric.score &&
      previous.metric.tiebreak === entry.metric.tiebreak;

    const rank = sameAsPrevious ? lastRank : index + 1;
    lastRank = rank;

    const split = sorted.some(
      (candidate) =>
        candidate.originalIndex !== entry.originalIndex &&
        candidate.metric.score === entry.metric.score &&
        candidate.metric.tiebreak === entry.metric.tiebreak
    );

    return {
      ...entry.metric,
      originalIndex: entry.originalIndex,
      rank,
      split
    };
  });

  return stableSortBy(ranked, (a, b) => a.originalIndex - b.originalIndex).map(
    ({ originalIndex: _, ...entry }) => entry
  );
}

export function deriveTeamStandings(submissions: Submission[], playerScores: PlayerScore[]): TeamStanding[] {
  const scoresByCode = new Map(playerScores.map((score) => [score.golferCode, score]));

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
      round: (roundIndex + 1) as 1 | 2 | 3 | 4,
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
