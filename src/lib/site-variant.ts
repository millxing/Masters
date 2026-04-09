export type SiteVariant = "full" | "submission";

export function parseSiteVariant(value: string | undefined): SiteVariant {
  return value === "submission" ? "submission" : "full";
}

export function isSubmissionVariant(siteVariant: SiteVariant) {
  return siteVariant === "submission";
}
