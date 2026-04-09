export const poolRules = [
  "Pick a team name.",
  "Each team picks 3 to 8 golfers from the pool.",
  "You can pick the same golfer multiple times.",
  "The total normalized probability of your team cannot exceed 15%.",
  "Only golfers actually in the Masters field should be selected.",
  "Each round is won by the lowest combined score of any 3 golfers on a team.",
  "The final is won by the lowest combined four-round total of any 3 golfers.",
  "Ties are broken by the 4th-lowest score. If that still ties, the pot is split.",
  "Any golfer who does not play a round receives the highest score in that round plus one.",
  "Playoff holes do not count toward round 4 or the final."
];

export const payouts = [
  { label: "Round 1", value: "12.5% of pot" },
  { label: "Round 2", value: "12.5% of pot" },
  { label: "Round 3", value: "12.5% of pot" },
  { label: "Round 4", value: "12.5% of pot" },
  { label: "Final", value: "50.0% of pot" }
];
