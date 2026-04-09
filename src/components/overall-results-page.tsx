import { RoundResultsTable } from "@/components/round-results-table";
import { repository } from "@/lib/data/repository";
import { buildOverallRows } from "@/lib/pool-display";

export function OverallResultsPage() {
  const golfers = repository.listGolfers();
  const submissions = repository.listSubmissions();
  const standings = repository.getDerivedStandings();
  const snapshot = repository.getLatestSnapshot();
  const playerScores = snapshot ? repository.getPlayerScoresForSnapshot(snapshot.id) : [];
  const rows = playerScores.length > 0
    ? buildOverallRows(submissions, golfers, standings, playerScores)
    : [];
  const isFinished = playerScores.length > 0 && playerScores.every((score) => typeof score.total === "number");

  return (
    <RoundResultsTable
      rows={rows}
      title="Overall Results"
      scoreLabel="Final"
      statusLabel={isFinished ? "Tournament Finished" : "In Progress"}
    />
  );
}
