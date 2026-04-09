import type { RoundDisplayRow } from "@/lib/pool-display";

type RoundResultsTableProps = {
  rows: RoundDisplayRow[];
  roundNumber?: 1 | 2 | 3 | 4;
  scoreLabel?: string;
  statusLabel?: string;
  title?: string;
};

export function RoundResultsTable({
  rows,
  roundNumber,
  scoreLabel = "Score",
  statusLabel = "In Progress",
  title
}: RoundResultsTableProps) {
  const heading = title ?? `Round ${roundNumber} Results`;
  const showCaptain = rows.some((row) => row.captain.trim().length > 0);

  if (rows.length === 0) {
    return (
      <section className="panel page-panel page-panel-centered">
        <h1 className="page-heading">{heading}</h1>
        <p className="results-subheading">{statusLabel}</p>
        <p className="page-note">{title ? "Results will appear after the first score import." : "Round results will appear after the first score import."}</p>
      </section>
    );
  }

  return (
    <div className="page-wrap page-wrap-wide results-page-wrap">
      <section className="page-panel">
        <h1 className="page-heading">{heading}</h1>
        <p className="results-subheading">{statusLabel}</p>
      </section>
      <section className="results-table-shell">
        <div className="results-table-wrap">
          <table className="results-table round-results-table">
            <thead>
              <tr>
                <th className="round-results-team-col">Team</th>
                {showCaptain ? <th className="round-results-captain-col">Captain</th> : null}
                <th className="results-score-col">{scoreLabel}</th>
                {Array.from({ length: 8 }, (_, index) => (
                  <th className="round-results-golfer-col" key={index}>Golfer {index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.teamNumber}-${row.teamName}`}>
                  <td className="round-results-team-cell">
                    <div className="round-results-team-name">{row.teamName}</div>
                  </td>
                  {showCaptain ? (
                    <td className="round-results-captain-cell">
                      <div className="round-results-captain-name">{row.captain}</div>
                    </td>
                  ) : null}
                  <td className="results-total-score">{row.teamScore}</td>
                  {row.slots.map((slot, index) => (
                    <td className="round-results-golfer-cell" key={`${row.teamNumber}-${index}`}>
                      <div className="round-results-slot-name">{slot.golfer}</div>
                      <div className="results-slot-score">{slot.score}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
