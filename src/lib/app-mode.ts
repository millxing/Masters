export type AppMode = "replay2025" | "rosterSandbox" | "leaderboardSandbox" | "live";

export type FixturePresetId =
  | "replay2025-reset"
  | "roster-empty-open"
  | "roster-empty-locked"
  | "leaderboard-round1"
  | "leaderboard-cut"
  | "leaderboard-round3"
  | "leaderboard-final";

export type FixturePresetDefinition = {
  id: FixturePresetId;
  mode: AppMode;
  label: string;
  description: string;
};

export type AppModeDefinition = {
  id: AppMode;
  label: string;
  description: string;
  allowsFixtureActions: boolean;
  defaultPresetId?: FixturePresetId;
};

export const defaultAppMode: AppMode = "replay2025";

export const appModeDefinitions: Record<AppMode, AppModeDefinition> = {
  replay2025: {
    id: "replay2025",
    label: "2025 Replay",
    description: "Regression baseline using the stored 2025 submissions, scores, and derived standings.",
    allowsFixtureActions: true,
    defaultPresetId: "replay2025-reset"
  },
  rosterSandbox: {
    id: "rosterSandbox",
    label: "Roster Sandbox",
    description: "Disposable roster testing with isolated submission storage and resettable lock states.",
    allowsFixtureActions: true,
    defaultPresetId: "roster-empty-open"
  },
  leaderboardSandbox: {
    id: "leaderboardSandbox",
    label: "Leaderboard Sandbox",
    description: "Resettable canned leaderboard states for scoreboard, round, and overall testing.",
    allowsFixtureActions: true,
    defaultPresetId: "leaderboard-round1"
  },
  live: {
    id: "live",
    label: "Live",
    description: "Real pool data. Test fixture loads and resets are blocked.",
    allowsFixtureActions: false
  }
};

export const fixturePresetDefinitions: Record<FixturePresetId, FixturePresetDefinition> = {
  "replay2025-reset": {
    id: "replay2025-reset",
    mode: "replay2025",
    label: "Reset 2025 Replay",
    description: "Restore the canonical 2025 replay dataset."
  },
  "roster-empty-open": {
    id: "roster-empty-open",
    mode: "rosterSandbox",
    label: "Empty Pool (Open)",
    description: "No submissions, open lock time, and the seeded golfer pool."
  },
  "roster-empty-locked": {
    id: "roster-empty-locked",
    mode: "rosterSandbox",
    label: "Empty Pool (Locked)",
    description: "No submissions with a past lock time to test closed-entry behavior."
  },
  "leaderboard-round1": {
    id: "leaderboard-round1",
    mode: "leaderboardSandbox",
    label: "Round 1 In Progress",
    description: "Round 1-only score snapshot with the replay rosters."
  },
  "leaderboard-cut": {
    id: "leaderboard-cut",
    mode: "leaderboardSandbox",
    label: "After Cut",
    description: "Round 2 snapshot with CUT statuses and no weekend rounds."
  },
  "leaderboard-round3": {
    id: "leaderboard-round3",
    mode: "leaderboardSandbox",
    label: "Round 3 Complete",
    description: "Three-round snapshot with final round still pending."
  },
  "leaderboard-final": {
    id: "leaderboard-final",
    mode: "leaderboardSandbox",
    label: "Final Leaderboard",
    description: "Completed tournament snapshot matching the replay dataset."
  }
};

export function parseAppMode(value: string | undefined): AppMode {
  if (value && value in appModeDefinitions) {
    return value as AppMode;
  }

  return defaultAppMode;
}

export function getAppModeDefinition(mode: AppMode) {
  return appModeDefinitions[mode];
}

export function getFixturePresetDefinition(presetId: FixturePresetId) {
  return fixturePresetDefinitions[presetId];
}

export function getDefaultPresetForMode(mode: AppMode) {
  return appModeDefinitions[mode].defaultPresetId;
}

export function listFixturePresetsForMode(mode: AppMode) {
  return Object.values(fixturePresetDefinitions).filter((preset) => preset.mode === mode);
}

export function getRuntimeDbFilename(mode: AppMode) {
  switch (mode) {
    case "replay2025":
      return "replay2025.json";
    case "rosterSandbox":
      return "rosterSandbox.json";
    case "leaderboardSandbox":
      return "leaderboardSandbox.json";
    case "live":
      return "live.json";
  }
}
