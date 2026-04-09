import { z } from "zod";

export const submissionSchema = z.object({
  participantName: z.string().trim().min(2, "Participant name is required."),
  email: z.string().trim().email("A valid email is required."),
  venmoHandle: z.string().trim().optional().transform((value) => value || ""),
  teamName: z.string().trim().min(2, "Team name is required."),
  picks: z.array(z.string().trim()).min(3, "Pick at least 3 golfers.").max(8, "Pick no more than 8 golfers.")
});

export const tournamentSchema = z.object({
  name: z.string().trim().min(2),
  year: z.coerce.number().int().min(2024).max(2100),
  lockTimeIso: z.string().datetime(),
  entryFee: z.coerce.number().min(0),
  round1: z.coerce.number().min(0),
  round2: z.coerce.number().min(0),
  round3: z.coerce.number().min(0),
  round4: z.coerce.number().min(0),
  final: z.coerce.number().min(0)
});
