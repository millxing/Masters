import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Golfer, Submission } from "@/lib/types";

function buildSubmission(): Submission {
  return {
    id: "submission_1",
    tournamentId: "tournament_1",
    participantName: "Test Captain",
    email: "captain@example.com",
    venmoHandle: null,
    teamName: "Secret Team",
    picks: ["rory"],
    probabilityTotal: 1.5,
    paymentStatus: "pending",
    editCode: "fern",
    editTokenHash: "token-hash",
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    lockedAt: null
  };
}

function buildGolfer(): Golfer {
  return {
    code: "rory",
    name: "Rory McIlroy",
    odds: 800,
    probability: 1.5,
    isActive: true,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z"
  };
}

async function renderRostersPage() {
  vi.resetModules();
  vi.doMock("@/lib/data/repository", () => ({
    repository: {
      listSubmissions: () => [buildSubmission()],
      listGolfers: () => [buildGolfer()]
    }
  }));

  const { default: RostersPage } = await import("@/app/rosters/page");
  return renderToStaticMarkup(RostersPage());
}

afterEach(() => {
  vi.doUnmock("@/lib/data/repository");
  vi.resetModules();
});

describe("rosters page", () => {
  it("shows published rosters", async () => {
    const html = await renderRostersPage();

    expect(html).toContain("Secret Team");
    expect(html).toContain("Rory McIlroy");
  });
});
