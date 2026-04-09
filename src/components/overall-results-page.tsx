import { RoundResultsTable } from "@/components/round-results-table";
import { repository } from "@/lib/data/repository";
import { buildOverallRows } from "@/lib/pool-display";

export function OverallResultsPage() {
  const golfers = repository.listGolfers();
  const submissions = repository.listSubmissions();
  const standings = repository.getDerivedStandings();
  const snapshot = repository.getLatestSnapshot();
  const playerScores = snapshot ? repository.getPlayerScoresForSnapshot(snapshot.id) : [];
  const hasFinalScores = playerScores.some((score) => typeof score.rounds[3] === "number");
  const rows = hasFinalScores
    ? buildOverallRows(submissions, golfers, standings, playerScores)
    : [];
  const isFinished = hasFinalScores && playerScores.every((score) => typeof score.total === "number");

  return (
    <RoundResultsTable
      rows={rows}
      title="Overall Results"
      scoreLabel="Final"
      statusLabel={!hasFinalScores ? "Not Started" : isFinished ? "Tournament Finished" : "In Progress"}
      emptyMessage="Overall results will appear once final-round scores are available."
    />
  );
}
