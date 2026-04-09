import { RoundResultsTable } from "@/components/round-results-table";
import { repository } from "@/lib/data/repository";
import { buildRoundRows } from "@/lib/pool-display";

export function RoundResultsPage({ roundNumber }: { roundNumber: 1 | 2 | 3 | 4 }) {
  const golfers = repository.listGolfers();
  const submissions = repository.listSubmissions();
  const standings = repository.getDerivedStandings();
  const snapshot = repository.getLatestSnapshot();
  const playerScores = snapshot ? repository.getPlayerScoresForSnapshot(snapshot.id) : [];
  const roundIndex = roundNumber - 1;
  const hasRoundScores = playerScores.some((score) => typeof score.rounds[roundIndex] === "number");
  const rows = hasRoundScores
    ? buildRoundRows(submissions, golfers, standings, playerScores, roundNumber)
    : [];
  const isFinished = playerScores.length > 0 && playerScores.every((score) => typeof score.total === "number");

  return (
    <RoundResultsTable
      rows={rows}
      roundNumber={roundNumber}
      statusLabel={!hasRoundScores ? "Not Started" : isFinished ? "Round Finished" : "In Progress"}
      emptyMessage="Round results will appear once ESPN publishes round scores."
    />
  );
}
