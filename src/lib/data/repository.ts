import { store } from "@/lib/data/store";
import type {
  Database,
  Golfer,
  PlayerScore,
  ScoreSnapshot,
  Submission,
  TeamStanding,
  Tournament
} from "@/lib/types";

export const repository = {
  getDatabase: () => store.getDatabase(),
  saveDatabase: (db: Database) => store.saveDatabase(db),
  getTournament: () => store.getTournament(),
  updateTournament: (tournament: Tournament) => store.updateTournament(tournament),
  listGolfers: () => store.listGolfers(),
  replaceGolfers: (golfers: Golfer[]) => store.replaceGolfers(golfers),
  listSubmissions: () => store.listSubmissions(),
  saveSubmission: (submission: Submission) => store.saveSubmission(submission),
  updateSubmission: (submission: Submission) => store.updateSubmission(submission),
  getSubmissionById: (submissionId: string) => store.getSubmissionById(submissionId),
  getSubmissionByTokenHash: (tokenHash: string) => store.getSubmissionByTokenHash(tokenHash),
  getLatestSnapshot: () => store.getLatestSnapshot(),
  getPlayerScoresForSnapshot: (snapshotId: string) => store.getPlayerScoresForSnapshot(snapshotId),
  replaceScores: (snapshot: ScoreSnapshot, playerScores: PlayerScore[]) =>
    store.replaceScores(snapshot, playerScores),
  replaceDerivedStandings: (standings: TeamStanding[]) => store.replaceDerivedStandings(standings),
  getDerivedStandings: () => store.getDerivedStandings()
};
