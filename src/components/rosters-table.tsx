import React from "react";
import type { RosterDisplayRow } from "@/lib/pool-display";

export function RostersTable({ rows }: { rows: RosterDisplayRow[] }) {
  if (rows.length === 0) {
    return (
      <section className="panel page-panel page-panel-centered">
        <h1 className="page-heading">Rosters</h1>
        <p className="page-note">No rosters have been submitted yet.</p>
      </section>
    );
  }

  const showCaptain = rows.some((row) => row.captain.trim().length > 0);

  return (
    <div className="page-wrap page-wrap-wide results-page-wrap">
      <section className="page-panel">
        <h1 className="page-heading">Rosters</h1>
      </section>
      <section className="results-table-shell">
        <div className="results-table-wrap">
          <table className="results-table rosters-table">
            <thead>
              <tr>
                <th className="rosters-team-col">Team</th>
                {showCaptain ? <th className="rosters-captain-col">Captain</th> : null}
                {Array.from({ length: 8 }, (_, index) => (
                  <th className="rosters-golfer-col" key={index}>Golfer {index + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.teamNumber}-${row.teamName}`}>
                  <td className="rosters-team-cell">
                    <div className="rosters-team-name">{row.teamName}</div>
                  </td>
                  {showCaptain ? (
                    <td className="rosters-captain-cell">
                      <div className="rosters-captain-name">{row.captain}</div>
                    </td>
                  ) : null}
                  {row.golfers.map((golfer, index) => (
                    <td className="rosters-golfer-cell" key={`${row.teamNumber}-${index}`}>
                      <div className="rosters-golfer-name">{golfer}</div>
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
