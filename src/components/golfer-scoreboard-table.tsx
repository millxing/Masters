"use client";

import { useState } from "react";
import type { GolferScoreboardRow } from "@/lib/pool-display";

type SortKey = "position" | "player" | "score" | "hole" | "r1" | "r2" | "r3" | "r4" | "total";
type SortDirection = "asc" | "desc";

function compareText(left: string, right: string, direction: SortDirection) {
  return direction === "asc" ? left.localeCompare(right) : right.localeCompare(left);
}

function compareNumber(left: number, right: number, direction: SortDirection) {
  return direction === "asc" ? left - right : right - left;
}

export function GolferScoreboardTable({ rows }: { rows: GolferScoreboardRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  if (rows.length === 0) {
    return (
      <div className="panel">
        <h2>No golfer scores yet</h2>
        <p className="muted">Import the first score snapshot to populate the tournament scoreboard.</p>
      </div>
    );
  }

  const handleSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortKey(nextKey);
    setSortDirection("asc");
  };

  const sortedRows = [...rows].sort((left, right) => {
    switch (sortKey) {
      case "position":
        return (
          compareNumber(left.positionValue, right.positionValue, sortDirection) ||
          compareText(left.golferName, right.golferName, "asc")
        );
      case "player":
        return compareText(left.golferName, right.golferName, sortDirection);
      case "score":
        return (
          compareNumber(left.scoreValue, right.scoreValue, sortDirection) ||
          compareText(left.golferName, right.golferName, "asc")
        );
      case "hole":
        return (
          compareNumber(left.holeValue, right.holeValue, sortDirection) ||
          compareText(left.golferName, right.golferName, "asc")
        );
      case "r1":
      case "r2":
      case "r3":
      case "r4": {
        const roundIndex = Number(sortKey[1]) - 1;
        return (
          compareNumber(left.roundValues[roundIndex] ?? Number.POSITIVE_INFINITY, right.roundValues[roundIndex] ?? Number.POSITIVE_INFINITY, sortDirection) ||
          compareText(left.golferName, right.golferName, "asc")
        );
      }
      case "total":
        return (
          compareNumber(left.totalValue, right.totalValue, sortDirection) ||
          compareText(left.golferName, right.golferName, "asc")
        );
      default:
        return compareNumber(left.order, right.order, "asc");
    }
  });

  const getIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  return (
    <section className="scoreboard-table-shell">
      <div className="scoreboard-table-wrap">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("position")}>Pos{getIndicator("position")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("player")}>Player{getIndicator("player")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("score")}>Score{getIndicator("score")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("hole")}>Thru{getIndicator("hole")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("r1")}>R1{getIndicator("r1")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("r2")}>R2{getIndicator("r2")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("r3")}>R3{getIndicator("r3")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("r4")}>R4{getIndicator("r4")}</button></th>
              <th><button type="button" className="scoreboard-sort-button" onClick={() => handleSort("total")}>Tot{getIndicator("total")}</button></th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.golferCode}>
                <td>{row.position || "—"}</td>
                <td>
                  <strong>{row.golferName}</strong>
                </td>
                <td>{row.score || "—"}</td>
                <td>{row.hole}</td>
                {row.rounds.map((round, index) => (
                  <td key={`${row.golferCode}-${index}`}>{round}</td>
                ))}
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
