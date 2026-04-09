import { notFound } from "next/navigation";

export function requireFullSiteVariant() {
  return;
}

export function requireRosterEntryOpen() {
  notFound();
}
