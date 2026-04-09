import { RoundResultsTable } from "@/components/round-results-table";
import { repository } from "@/lib/data/repository";
import { buildRoundRows } from "@/lib/pool-display";

function hasLiveToPar(status: string) {
  const trimmed = status.trim().toUpperCase();
  return trimmed === "E" || /^[+-]?\d+$/.test(trimmed);
}

function isRoundFinished(
  playerScores: Array<{ rounds: Array<number | null>; status: string }>,
  roundIndex: number
) {
  return playerScores.length > 0 && playerScores.every((score) => {
    if (typeof score.rounds[roundIndex] === "number") {
      return true;
    }

    return roundIndex >= 2 && score.status.trim().toUpperCase() === "CUT";
  });
}

export function RoundResultsPage({ roundNumber }: { roundNumber: 1 | 2 | 3 | 4 }) {
  const golfers = repository.listGolfers();
  const submissions = repository.listSubmissions();
  const standings = repository.getDerivedStandings();
  const snapshot = repository.getLatestSnapshot();
  const playerScores = snapshot ? repository.getPlayerScoresForSnapshot(snapshot.id) : [];
  const roundIndex = roundNumber - 1;
  const hasRoundScores = playerScores.some((score) =>
    typeof score.rounds[roundIndex] === "number"
      || (roundNumber === 1 && hasLiveToPar(score.status))
  );
  const rows = hasRoundScores
    ? buildRoundRows(submissions, golfers, standings, playerScores, roundNumber)
    : [];
  const isFinished = isRoundFinished(playerScores, roundIndex);
  const statusLabel = !hasRoundScores ? "Not Started" : isFinished ? "Round Finished" : "In Progress";

  return (
    <RoundResultsTable
      rows={rows}
      roundNumber={roundNumber}
      statusLabel={statusLabel}
      emptyMessage="Round results will appear once ESPN publishes round scores."
      lastUpdatedAt={statusLabel === "In Progress" ? snapshot?.importedAt : undefined}
    />
  );
}
