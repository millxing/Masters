import type { TeamStanding } from "@/lib/types";
import { formatProbability } from "@/lib/utils";

const roundTeamPar = 72 * 3;
const finalTeamPar = 72 * 4 * 3;
const tiebreakPar = 72 * 4;

export function LeaderboardTable({ standings }: { standings: TeamStanding[] }) {
  if (standings.length === 0) {
    return (
      <div className="panel">
        <h2>No standings yet</h2>
        <p className="muted">Import the first score snapshot to populate round and final results.</p>
      </div>
    );
  }

  const ordered = [...standings].sort((a, b) => {
    if (a.final.rank !== b.final.rank) return a.final.rank - b.final.rank;
    if (a.final.score !== b.final.score) return a.final.score - b.final.score;
    return a.final.tiebreak - b.final.tiebreak;
  });

  return (
    <div className="panel table-panel">
      <div className="eyebrow">Standings</div>
      <h2>Final leaderboard</h2>
      <div className="table-wrap">
        <table className="leaderboard">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Participant</th>
              <th>Final</th>
              <th>TB</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
              <th>R4</th>
              <th>Prob.</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((standing) => (
              <tr key={standing.submissionId}>
                <td>{standing.final.rank}{standing.final.split ? "*" : ""}</td>
                <td>
                  <strong>{standing.teamName}</strong>
                  <div className="table-subtext">{standing.picks.join(", ")}</div>
                </td>
                <td>{standing.participantName}</td>
                <td>{standing.final.score - finalTeamPar}</td>
                <td>{standing.final.tiebreak - tiebreakPar}</td>
                {standing.rounds.map((round) => (
                  <td key={round.round}>
                    {round.score - roundTeamPar}
                    <div className="table-subtext">#{round.rank}{round.split ? "*" : ""}</div>
                  </td>
                ))}
                <td>{formatProbability(standing.probabilityTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">Asterisk means the result is currently tied after the 4th-score tiebreak and would split the pot.</p>
    </div>
  );
}
