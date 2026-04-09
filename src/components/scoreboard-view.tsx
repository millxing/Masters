import { AutoRefresh } from "@/components/auto-refresh";
import { GolferScoreboardTable } from "@/components/golfer-scoreboard-table";
import { repository } from "@/lib/data/repository";
import { formatDateTime } from "@/lib/dates";
import { buildGolferScoreboardRows } from "@/lib/pool-display";

export function ScoreboardView() {
  const snapshot = repository.getLatestSnapshot();
  const playerScores = snapshot ? repository.getPlayerScoresForSnapshot(snapshot.id) : [];
  const rows = buildGolferScoreboardRows(playerScores);

  return (
    <div className="page-wrap page-wrap-wide results-page-wrap">
      <AutoRefresh />
      <section className="page-panel page-panel-centered">
        <h1 className="page-heading">Scoreboard</h1>
        <p className="page-note">
          {snapshot
            ? `Last updated ${formatDateTime(snapshot.importedAt)}`
            : "No scores imported yet."}
        </p>
      </section>
      <GolferScoreboardTable rows={rows} />
    </div>
  );
}
