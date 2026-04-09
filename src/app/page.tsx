import React from "react";
import { welcomeMessage, welcomeParagraphs, welcomeTitle } from "@/lib/site-content";

export default function HomePage() {
  return (
    <div className="page-wrap">
      <section className="welcome-stage">
        <div className="welcome-card">
          <div className="welcome-copy">
            <h1 className="page-heading">{welcomeTitle}</h1>
            <p className="page-note">{welcomeMessage}</p>
            <div className="rules-copy">
              {welcomeParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
