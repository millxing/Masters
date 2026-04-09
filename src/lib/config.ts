import path from "node:path";
import type { AppMode } from "@/lib/app-mode";
import type { SiteVariant } from "@/lib/site-variant";

const rootDir = process.cwd();
const runtimeDataRoot = process.env.MASTERS_RUNTIME_ROOT
  ? path.resolve(process.env.MASTERS_RUNTIME_ROOT)
  : path.join(rootDir, "data", "runtime");
const appMode: AppMode = "live";
const siteVariant: SiteVariant = "full";
const resolvedDbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(rootDir, "data", "db.json");
const staticExport = process.env.STATIC_EXPORT === "1";

export const config = {
  rootDir,
  rulesPath: path.join(rootDir, "rules.txt"),
  appMode,
  siteVariant,
  staticExport,
  runtimeDataRoot,
  dbPath: resolvedDbPath,
  appBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  cookieSecret: process.env.COOKIE_SECRET ?? "masters-pool-dev-secret",
  adminPasscode: process.env.ADMIN_PASSCODE ?? "masters-admin",
  espnTournamentId: process.env.ESPN_TOURNAMENT_ID ?? "",
  devViewerPasscode: process.env.DEV_VIEWER_PASSCODE ?? "green-jacket",
  defaultLockTimeIso:
    process.env.DEFAULT_LOCK_TIME_ISO ?? new Date("2026-04-09T11:00:00-04:00").toISOString()
};
