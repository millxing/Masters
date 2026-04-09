"use client";

import React, { useState } from "react";

type PasscodeFormProps = {
  endpoint: string;
  title: string;
  description: string;
  buttonLabel: string;
};

export function PasscodeForm({ endpoint, title, description, buttonLabel }: PasscodeFormProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Access denied.");
      setLoading(false);
      return;
    }

    window.location.reload();
  }

  return (
    <form className="panel panel-form" onSubmit={handleSubmit}>
      <div className="eyebrow">Private Access</div>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <label className="field">
        <span>Passcode</span>
        <input
          type="password"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          placeholder="Enter passcode"
          required
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Checking..." : buttonLabel}
      </button>
    </form>
  );
}
