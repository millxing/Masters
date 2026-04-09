import { repository } from "@/lib/data/repository";
import { deriveTeamStandings } from "@/lib/scoring/engine";
import type { TeamStanding } from "@/lib/types";

export function recomputeStandings() {
  const snapshot = repository.getLatestSnapshot();
  const submissions = repository.listSubmissions();

  if (!snapshot || submissions.length === 0) {
    const empty: TeamStanding[] = [];
    repository.replaceDerivedStandings(empty);
    return empty;
  }

  const scores = repository.getPlayerScoresForSnapshot(snapshot.id);
  const standings = deriveTeamStandings(submissions, scores);
  repository.replaceDerivedStandings(standings);
  return standings;
}
