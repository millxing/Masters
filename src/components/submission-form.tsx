"use client";

import React, { useMemo, useState } from "react";
import { formatProbability } from "@/lib/utils";
import type { Golfer, Submission, Tournament } from "@/lib/types";

type SubmissionFormProps = {
  golfers: Golfer[];
  tournament: Tournament;
  endpoint: string;
  method?: "POST" | "PATCH";
  initialSubmission?: Submission | null;
  editCode?: string;
};

const maxSlots = 8;

export function SubmissionForm({
  golfers,
  tournament,
  endpoint,
  method = "POST",
  initialSubmission,
  editCode
}: SubmissionFormProps) {
  const initialPicks = initialSubmission?.picks.length
    ? [...initialSubmission.picks, ...Array.from({ length: maxSlots - initialSubmission.picks.length }, () => "")]
    : Array.from({ length: maxSlots }, () => "");

  const [participantName, setParticipantName] = useState(initialSubmission?.participantName ?? "");
  const [email, setEmail] = useState(initialSubmission?.email ?? "");
  const [teamName, setTeamName] = useState(initialSubmission?.teamName ?? "");
  const [picks, setPicks] = useState<string[]>(initialPicks);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successEditCode, setSuccessEditCode] = useState("");
  const [hasSavedSubmission, setHasSavedSubmission] = useState(Boolean(initialSubmission));
  const [loading, setLoading] = useState(false);

  const activeGolfers = useMemo(
    () =>
      golfers
        .filter((golfer) => golfer.isActive)
        .sort((a, b) => {
          if (b.probability !== a.probability) {
            return b.probability - a.probability;
          }

          return a.name.localeCompare(b.name);
        }),
    [golfers]
  );
  const golferMap = useMemo(() => new Map(activeGolfers.map((golfer) => [golfer.code, golfer] as const)), [activeGolfers]);
  const filledPicks = picks.filter(Boolean);
  const probabilityTotal = filledPicks.reduce(
    (sum, code) => sum + (golferMap.get(code)?.probability ?? 0),
    0
  );
  const isProbabilityOverLimit = probabilityTotal > 0.15;

  function updatePick(index: number, value: string) {
    setPicks((current) => current.map((pick, currentIndex) => (currentIndex === index ? value : pick)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isProbabilityOverLimit) {
      setError("Team probability cannot exceed 15.00%.");
      setSuccess("");
      setSuccessEditCode("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setSuccessEditCode("");

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantName,
        email,
        teamName,
        picks: picks.filter(Boolean),
        ...(editCode ? { editCode } : {})
      })
    });

    const payload = (await response.json()) as { error?: string; editCode?: string; message?: string };

    if (!response.ok) {
      setError(payload.error ?? "Could not save your team.");
      setLoading(false);
      return;
    }

    setSuccess(payload.message ?? "Saved.");
    setSuccessEditCode(payload.editCode ? payload.editCode.toUpperCase() : "");
    setHasSavedSubmission(true);
    setLoading(false);
  }

  return (
    <form className="roster-form" onSubmit={handleSubmit}>
      <div className="roster-grid">
        {picks.map((pick, index) => {
          const selectedGolfer = golferMap.get(pick);

          return (
            <div className="roster-row" key={index}>
              <div className="slot-badge" aria-hidden="true">
                {index + 1}
              </div>
              <label className="slot-select-shell">
                <span className="sr-only">Pick {index + 1}</span>
                <select
                  className="slot-select"
                  value={pick}
                  onChange={(event) => updatePick(index, event.target.value)}
                >
                  <option value="">Select Golfer</option>
                  {activeGolfers.map((golfer) => (
                    <option key={`${golfer.code}-${index}`} value={golfer.code}>
                      {golfer.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="probability-box">
                <span className="probability-label">Probability</span>
                <strong className="probability-value">
                  {selectedGolfer ? formatProbability(selectedGolfer.probability) : "--"}
                </strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="roster-summary">
        <div className="summary-card">
          <span>Golfers Selected</span>
          <strong>{filledPicks.length}</strong>
        </div>
        <div
          className={`summary-card summary-card-total ${isProbabilityOverLimit ? "summary-card-total-over" : "summary-card-total-safe"}`}
        >
          <span>Probability Total</span>
          <strong>{formatProbability(probabilityTotal)}</strong>
        </div>
        <div className="summary-card">
          <span>Rule Window</span>
          <strong>3 to 8 golfers, max 15% probability</strong>
        </div>
      </div>

      <section className="details-block">
        <div className="eyebrow">Team Details</div>
        <div className="form-grid">
          <label className="field">
            <span>Participant name</span>
            <input value={participantName} onChange={(event) => setParticipantName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Team name</span>
            <input value={teamName} onChange={(event) => setTeamName(event.target.value)} required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
        </div>
      </section>
      {error ? <p className="error-text">{error}</p> : null}
      {success ? (
        <p className="success-text">
          {successEditCode ? (
            <>
              {success} Your private edit code is <strong className="success-code">{successEditCode}</strong>.
            </>
          ) : (
            success
          )}
        </p>
      ) : null}
      <div className="button-row">
        <button className="button" type="submit" disabled={loading || isProbabilityOverLimit}>
          {loading ? "Saving..." : hasSavedSubmission ? "Edit Roster" : "Save Roster"}
        </button>
      </div>
    </form>
  );
}
