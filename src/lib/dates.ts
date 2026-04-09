import { repository } from "@/lib/data/repository";

export function isLocked() {
  return new Date() >= new Date(repository.getTournament().lockTimeIso);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}
