import type { Route } from "next";
import type { SiteVariant } from "@/lib/site-variant";

export type SiteNavItem = {
  key: string;
  label: string;
  href: Route;
  matchPrefixes?: string[];
};

const fullSiteNavItems: SiteNavItem[] = [
  { key: "rules", label: "Rules", href: "/rules" },
  { key: "rosters", label: "Rosters", href: "/rosters" },
  {
    key: "scoreboard",
    label: "Scoreboard",
    href: "/scoreboard",
    matchPrefixes: ["/scoreboard", "/leaderboard"]
  },
  { key: "round-1", label: "Round 1", href: "/round-1" },
  { key: "round-2", label: "Round 2", href: "/round-2" },
  { key: "round-3", label: "Round 3", href: "/round-3" },
  { key: "round-4", label: "Round 4", href: "/round-4" },
  { key: "overall", label: "Overall", href: "/overall" },
  { key: "payouts", label: "Payouts", href: "/payouts" }
];

export function getSiteNavItems(siteVariant: SiteVariant) {
  return fullSiteNavItems;
}

export const welcomeMessage = "Pool commissioner's welcome message here";

export const welcomeTitle = "Welcome";

export const welcomeParagraphs = [
  "The 2026 Masters Pool is locked and live.",
  "Use the menu to view the rules, team rosters, live scoreboard, round results, overall standings, and payouts.",
  "Good luck."
];

export const rulesParagraphs = [
  "Pick a name for your team. Please don't leave it to us to name your team. You won't like it.",
  "Each team picks 3-8 golfers from the pool of golfers.",
  "You can pick the same golfer multiple times.",
  "Note that the pool of golfers is larger than the size of the Masters field. It's on you to make sure that everyone you pick is actually competing in the tournament.",
  "The sum of the golfer probabilities on a team cannot exceed 15%.",
  "Roster entry is now closed.",
  "For each round, the team with the lowest combined score of any THREE golfers will win that round.",
  "The Final Score is won by the team with the lowest combined final score (4 round total) of any THREE golfers.",
  "All ties are broken by the 4th lowest score on each team. If there is still a tie, then the pot will be split. Any team without a 4th golfer will get the highest score in that round plus one as their 4th best score (i.e. you lose).",
  "Any golfers that do not golf in a given round (withdraw or missed cut) get the highest score in that round plus one.",
  "Playoff rounds do not count toward the 4th round or the final score. The pool ends after the 18th hole on the 4th round."
];

export const payoutLines = [
  "Payouts",
  "1st Round: 12.5% of pot",
  "2nd Round: 12.5% of pot",
  "3rd Round: 12.5% of pot",
  "4th Round: 12.5% of pot",
  "Final Score: 50.0% of pot",
  "Unbroken ties split the pot equally.",
  "",
  "$65 entry. All proceeds distributed to winners.",
  "",
  "All payments, distributions made via Venmo (@robschoen)."
];
