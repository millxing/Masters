export type PaymentStatus = "pending" | "paid";
export type ScoreSource = "espn" | "manual";

export type Tournament = {
  id: string;
  name: string;
  year: number;
  lockTimeIso: string;
  entryFee: number;
  payoutPercentages: {
    round1: number;
    round2: number;
    round3: number;
    round4: number;
    final: number;
  };
  viewerPasscode: string;
  updatedAt: string;
};

export type Golfer = {
  code: string;
  name: string;
  odds: number;
  probability: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Submission = {
  id: string;
  tournamentId: string;
  participantName: string;
  email: string;
  venmoHandle: string | null;
  teamName: string;
  picks: string[];
  probabilityTotal: number;
  paymentStatus: PaymentStatus;
  editCode: string;
  editTokenHash?: string;
  createdAt: string;
  updatedAt: string;
  lockedAt: string | null;
};

export type ScoreSnapshot = {
  id: string;
  tournamentId: string;
  source: ScoreSource;
  importedAt: string;
  sourceLabel: string;
  rawPayload: string;
};

export type PlayerScore = {
  snapshotId: string;
  golferCode: string;
  golferName: string;
  position?: string;
  thru?: string;
  status: string;
  rounds: Array<number | null>;
  total: number | null;
};

export type RoundStanding = {
  round: 1 | 2 | 3 | 4;
  score: number;
  tiebreak: number;
  countedCodes: string[];
  fallbackScore: number;
  rank: number;
  split: boolean;
};

export type FinalStanding = {
  score: number;
  tiebreak: number;
  countedCodes: string[];
  fallbackScore: number;
  rank: number;
  split: boolean;
};

export type TeamStanding = {
  submissionId: string;
  teamName: string;
  participantName: string;
  picks: string[];
  probabilityTotal: number;
  rounds: RoundStanding[];
  final: FinalStanding;
};

export type Database = {
  tournament: Tournament;
  golfers: Golfer[];
  submissions: Submission[];
  scoreSnapshots: ScoreSnapshot[];
  playerScores: PlayerScore[];
  derivedTeamStandings: TeamStanding[];
};

export type ScoreImportRow = {
  code?: string;
  name?: string;
  position?: string;
  thru?: string;
  status?: string;
  r1?: number | null;
  r2?: number | null;
  r3?: number | null;
  r4?: number | null;
  total?: number | null;
};
