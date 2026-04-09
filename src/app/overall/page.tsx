import { OverallResultsPage } from "@/components/overall-results-page";
import { requireFullSiteVariant } from "@/lib/page-access";

export default function OverallPage() {
  requireFullSiteVariant();
  return <OverallResultsPage />;
}
