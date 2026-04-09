import { ScoreboardView } from "@/components/scoreboard-view";
import { requireFullSiteVariant } from "@/lib/page-access";

export default function LeaderboardPage() {
  requireFullSiteVariant();
  return <ScoreboardView />;
}
