"use client";

import React, { useState } from "react";
import { SubmissionForm } from "@/components/submission-form";
import type { Golfer, Submission, Tournament } from "@/lib/types";

type SubmissionEditAccessProps = {
  golfers: Golfer[];
  identifier: string;
  isLegacyToken?: boolean;
  submission: Submission;
  tournament: Tournament;
};

export function SubmissionEditAccess({
  golfers,
  identifier,
  isLegacyToken = false,
  submission,
  tournament
}: SubmissionEditAccessProps) {
  const [codeInput, setCodeInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [revealedCode, setRevealedCode] = useState("");
  const [unlockedCode, setUnlockedCode] = useState("");
  const [loadingCode, setLoadingCode] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  if (isLegacyToken) {
    return (
      <SubmissionForm
        endpoint={`/api/submissions/${identifier}`}
        golfers={golfers}
        method="PATCH"
        tournament={tournament}
        initialSubmission={submission}
      />
    );
  }

  async function handleCodeUnlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingCode(true);
    setError("");

    const response = await fetch(`/api/submissions/${identifier}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editCode: codeInput })
    });

    const payload = (await response.json()) as { editCode?: string; error?: string };

    if (!response.ok || !payload.editCode) {
      setError(payload.error ?? "Could not unlock this roster.");
      setLoadingCode(false);
      return;
    }

    setUnlockedCode(payload.editCode);
    setRevealedCode(payload.editCode);
    setLoadingCode(false);
  }

  async function handleEmailRecovery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingEmail(true);
    setError("");

    const response = await fetch(`/api/submissions/${identifier}/access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput })
    });

    const payload = (await response.json()) as { editCode?: string; error?: string };

    if (!response.ok || !payload.editCode) {
      setError(payload.error ?? "Could not recover the code.");
      setLoadingEmail(false);
      return;
    }

    setRevealedCode(payload.editCode);
    setUnlockedCode(payload.editCode);
    setLoadingEmail(false);
  }

  return (
    <div className="edit-roster-stack">
      {!unlockedCode ? (
        <section className="panel">
          <div className="eyebrow">Edit Access</div>
          <h2 className="page-heading page-heading-left">Unlock This Roster</h2>
          <p className="page-note page-note-left">
            Enter the private four-letter code for <strong>{submission.teamName}</strong> to edit this roster.
          </p>
          <form className="edit-access-form" onSubmit={handleCodeUnlock}>
            <label className="field">
              <span>Private code</span>
              <input
                autoCapitalize="none"
                autoCorrect="off"
                maxLength={4}
                onChange={(event) => setCodeInput(event.target.value.toLowerCase())}
                placeholder="fern"
                required
                value={codeInput}
              />
            </label>
            <button className="button" disabled={loadingCode} type="submit">
              {loadingCode ? "Checking..." : "Unlock Roster"}
            </button>
          </form>
        </section>
      ) : null}

      <section className="panel">
        <div className="eyebrow">Recover Code</div>
        <h2 className="page-heading page-heading-left">Find The Code By Email</h2>
        <p className="page-note page-note-left">
          If you entered the roster email correctly, the code will be shown here.
        </p>
        <form className="edit-access-form" onSubmit={handleEmailRecovery}>
          <label className="field">
            <span>Roster email</span>
            <input
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(event) => setEmailInput(event.target.value)}
              placeholder="captain@example.com"
              required
              type="email"
              value={emailInput}
            />
          </label>
          <button className="button" disabled={loadingEmail} type="submit">
            {loadingEmail ? "Checking..." : "Show Code"}
          </button>
        </form>
        {revealedCode ? (
          <p className="success-text">Your private edit code is {revealedCode}.</p>
        ) : null}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {unlockedCode ? (
        <section className="panel">
          <div className="eyebrow">Roster Form</div>
          <h2 className="page-heading page-heading-left">Edit {submission.teamName}</h2>
          <p className="page-note page-note-left">
            Your private edit code is <strong>{unlockedCode}</strong>.
          </p>
          <SubmissionForm
            editCode={unlockedCode}
            endpoint={`/api/submissions/${identifier}`}
            golfers={golfers}
            method="PATCH"
            tournament={tournament}
            initialSubmission={submission}
          />
        </section>
      ) : null}
    </div>
  );
}
