import { RoundResultsPage } from "@/components/round-results-page";
import { requireFullSiteVariant } from "@/lib/page-access";

export default function RoundTwoPage() {
  requireFullSiteVariant();
  return <RoundResultsPage roundNumber={2} />;
}
