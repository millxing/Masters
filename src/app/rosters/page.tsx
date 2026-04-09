import React from "react";
import { RostersTable } from "@/components/rosters-table";
import { repository } from "@/lib/data/repository";
import { buildRosterRows } from "@/lib/pool-display";

export default function RostersPage() {
  const rows = buildRosterRows(repository.listSubmissions(), repository.listGolfers());

  return <RostersTable rows={rows} />;
}
