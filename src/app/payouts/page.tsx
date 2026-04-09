import React from "react";
import { requireFullSiteVariant } from "@/lib/page-access";
import { payoutLines } from "@/lib/site-content";

export default function PayoutsPage() {
  requireFullSiteVariant();

  return (
    <div className="page-wrap">
      <section className="page-panel page-panel-copy">
        <h1 className="page-heading">Payouts</h1>
        <div className="rules-copy">
          {payoutLines.map((line, index) =>
            line === "" ? <br key={`break-${index}`} /> : <p key={`${line}-${index}`}>{line}</p>
          )}
        </div>
      </section>
    </div>
  );
}
