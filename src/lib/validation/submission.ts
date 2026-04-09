import { repository } from "@/lib/data/repository";
import { submissionSchema } from "@/lib/validation/schemas";
import type { Golfer, Submission } from "@/lib/types";
import { roundTo } from "@/lib/utils";

export function validateSubmissionInput(input: unknown, existingSubmission?: Submission | null) {
  const parsed = submissionSchema.parse(input);
  const golfers = repository.listGolfers();
  const tournament = repository.getTournament();

  if (new Date() >= new Date(tournament.lockTimeIso)) {
    throw new Error("Submissions are locked.");
  }

  const activeGolfers = new Map(golfers.filter((golfer) => golfer.isActive).map((golfer) => [golfer.code, golfer] as const));

  const picks = parsed.picks.map((pick) => pick.trim()).filter(Boolean);

  if (picks.length < 3 || picks.length > 8) {
    throw new Error("Pick at least 3 golfers and no more than 8.");
  }

  const invalidPick = picks.find((pick) => !activeGolfers.has(pick));

  if (invalidPick) {
    throw new Error(`Golfer code ${invalidPick} is not active in the field.`);
  }

  const probabilityTotal = roundTo(
    picks.reduce((sum, pick) => sum + (activeGolfers.get(pick)?.probability ?? 0), 0),
    6
  );

  if (probabilityTotal > 0.15) {
    throw new Error("Team probability cannot exceed 15.00%.");
  }

  return {
    participantName: parsed.participantName,
    email: parsed.email,
    venmoHandle: parsed.venmoHandle || null,
    teamName: parsed.teamName,
    picks,
    probabilityTotal,
    paymentStatus: existingSubmission?.paymentStatus ?? "pending"
  };
}
