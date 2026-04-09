"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FixturePresetDefinition, AppMode } from "@/lib/app-mode";
import type { Golfer, Submission, TeamStanding, Tournament } from "@/lib/types";

type AdminDashboardProps = {
  appMode: AppMode;
  modeLabel: string;
  modeDescription: string;
  allowsFixtureActions: boolean;
  runtimePathLabel: string;
  presets: FixturePresetDefinition[];
  tournament: Tournament;
  golfers: Golfer[];
  submissions: Submission[];
  standings: TeamStanding[];
  lastImportedAt: string | null;
  lastSourceLabel: string | null;
};

export function AdminDashboard({
  appMode,
  modeLabel,
  modeDescription,
  allowsFixtureActions,
  runtimePathLabel,
  presets,
  tournament,
  golfers,
  submissions,
  standings,
  lastImportedAt,
  lastSourceLabel
}: AdminDashboardProps) {
  const router = useRouter();
  const [settingsMessage, setSettingsMessage] = useState("");
  const [golfersMessage, setGolfersMessage] = useState("");
  const [scoresMessage, setScoresMessage] = useState("");
  const [runtimeMessage, setRuntimeMessage] = useState("");
  const [manualCsv, setManualCsv] = useState("");
  const [golferCsv, setGolferCsv] = useState("");
  const [settings, setSettings] = useState({
    name: tournament.name,
    year: String(tournament.year),
    lockTimeIso: tournament.lockTimeIso.slice(0, 16),
    entryFee: String(tournament.entryFee),
    round1: String(tournament.payoutPercentages.round1),
    round2: String(tournament.payoutPercentages.round2),
    round3: String(tournament.payoutPercentages.round3),
    round4: String(tournament.payoutPercentages.round4),
    final: String(tournament.payoutPercentages.final)
  });

  async function submitJson(endpoint: string, body: unknown) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = (await response.json()) as { error?: string; message?: string; unmapped?: unknown[] };
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed.");
    }
    return payload;
  }

  async function applyRuntimeFixture(body: { action: "reset" } | { action: "loadPreset"; presetId: string }) {
    try {
      const payload = await submitJson("/api/admin/runtime/fixtures", body);
      setRuntimeMessage(payload.message ?? "Runtime updated.");
      router.refresh();
    } catch (error) {
      setRuntimeMessage(error instanceof Error ? error.message : "Could not update runtime fixtures.");
    }
  }

  const [defaultPreset, ...extraPresets] = presets;

  return (
    <div className="admin-grid">
      <section className="panel">
        <div className="eyebrow">Runtime Mode</div>
        <h2>{modeLabel}</h2>
        <p className="muted">{modeDescription}</p>
        <ul className="stat-list">
          <li><span>Mode key</span><strong>{appMode}</strong></li>
          <li><span>Runtime DB</span><strong>{runtimePathLabel}</strong></li>
          <li><span>Fixture actions</span><strong>{allowsFixtureActions ? "Enabled" : "Locked"}</strong></li>
        </ul>
        <div className="button-row">
          <button
            className="button"
            disabled={!allowsFixtureActions}
            onClick={() => applyRuntimeFixture({ action: "reset" })}
          >
            {defaultPreset ? "Reset Current Mode" : "Reset Unavailable"}
          </button>
          {extraPresets.map((preset) => (
            <button
              className="button button-secondary"
              disabled={!allowsFixtureActions}
              key={preset.id}
              onClick={() => applyRuntimeFixture({ action: "loadPreset", presetId: preset.id })}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="muted">
          {allowsFixtureActions
            ? "Fixture loads only affect the active mode database."
            : "Live mode blocks fixture loads and resets."}
        </p>
        {runtimeMessage ? <p className="muted">{runtimeMessage}</p> : null}
      </section>

      <section className="panel">
        <div className="eyebrow">Admin</div>
        <h2>Tournament settings</h2>
        <div className="form-grid">
          {Object.entries(settings).map(([key, value]) => (
            <label className="field" key={key}>
              <span>{key}</span>
              <input
                value={value}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, [key]: event.target.value }))
                }
                type={key === "lockTimeIso" ? "datetime-local" : "text"}
              />
            </label>
          ))}
        </div>
        <button
          className="button"
          onClick={async () => {
            try {
              const payload = await submitJson("/api/admin/tournament", {
                ...settings,
                lockTimeIso: new Date(settings.lockTimeIso).toISOString()
              });
              setSettingsMessage(payload.message ?? "Saved.");
              router.refresh();
            } catch (error) {
              setSettingsMessage(error instanceof Error ? error.message : "Could not save settings.");
            }
          }}
        >
          Save Settings
        </button>
        {settingsMessage ? <p className="muted">{settingsMessage}</p> : null}
      </section>

      <section className="panel">
        <div className="eyebrow">Golfers</div>
        <h2>Golfer pool import</h2>
        <p className="muted">
          Active golfers: {golfers.filter((golfer) => golfer.isActive).length} / {golfers.length}
        </p>
        <textarea
          className="textarea"
          rows={12}
          value={golferCsv}
          onChange={(event) => setGolferCsv(event.target.value)}
          placeholder="code,name,odds,probability,isActive"
        />
        <button
          className="button"
          onClick={async () => {
            try {
              const payload = await submitJson("/api/admin/golfers/import", { csvText: golferCsv });
              setGolfersMessage(payload.message ?? "Golfers updated.");
              router.refresh();
            } catch (error) {
              setGolfersMessage(error instanceof Error ? error.message : "Could not import golfers.");
            }
          }}
        >
          Import Golfers CSV
        </button>
        {golfersMessage ? <p className="muted">{golfersMessage}</p> : null}
      </section>

      <section className="panel">
        <div className="eyebrow">Scores</div>
        <h2>Live scoring</h2>
        <p className="muted">
          Latest snapshot: {lastImportedAt ? `${lastImportedAt} via ${lastSourceLabel}` : "No scores imported yet"}
        </p>
        <div className="button-row">
          <button
            className="button"
            onClick={async () => {
              try {
              const payload = await submitJson("/api/admin/scores/refresh-espn", {});
              setScoresMessage(payload.message ?? "ESPN refresh complete.");
              router.refresh();
            } catch (error) {
              setScoresMessage(error instanceof Error ? error.message : "ESPN refresh failed.");
            }
            }}
          >
            Refresh From ESPN
          </button>
          <button
            className="button button-secondary"
            onClick={async () => {
              try {
              const payload = await submitJson("/api/admin/standings/recompute", {});
              setScoresMessage(payload.message ?? "Standings recomputed.");
              router.refresh();
            } catch (error) {
              setScoresMessage(error instanceof Error ? error.message : "Recompute failed.");
            }
            }}
          >
            Recompute Only
          </button>
        </div>
        <textarea
          className="textarea"
          rows={12}
          value={manualCsv}
          onChange={(event) => setManualCsv(event.target.value)}
          placeholder="code,name,status,r1,r2,r3,r4,total"
        />
        <button
          className="button"
          onClick={async () => {
            try {
              const payload = await submitJson("/api/admin/scores/import", { csvText: manualCsv });
              setScoresMessage(
                payload.unmapped && payload.unmapped.length > 0
                  ? `Imported with ${payload.unmapped.length} unmapped row(s).`
                  : payload.message ?? "Scores imported."
              );
              router.refresh();
            } catch (error) {
              setScoresMessage(error instanceof Error ? error.message : "Score import failed.");
            }
          }}
        >
          Import Scores CSV
        </button>
        {scoresMessage ? <p className="muted">{scoresMessage}</p> : null}
      </section>

      <section className="panel">
        <div className="eyebrow">Pool Health</div>
        <h2>Current state</h2>
        <ul className="stat-list">
          <li><span>Submissions</span><strong>{submissions.length}</strong></li>
          <li><span>Paid entries</span><strong>{submissions.filter((submission) => submission.paymentStatus === "paid").length}</strong></li>
          <li><span>Standings rows</span><strong>{standings.length}</strong></li>
        </ul>
      </section>
    </div>
  );
}
