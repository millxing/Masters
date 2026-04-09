import React from "react";
import { payoutLines, rulesParagraphs } from "@/lib/site-content";

export function RulesContent() {
  return (
    <div className="page-wrap">
      <section className="page-panel page-panel-copy">
        <h1 className="page-heading">Rules</h1>
        <div className="rules-copy rules-copy-spaced">
          {rulesParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="rules-payouts">{payoutLines.join("\n")}</p>
        </div>
      </section>
    </div>
  );
}
