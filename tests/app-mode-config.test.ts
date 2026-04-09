import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = {
  dbPath: process.env.DB_PATH,
  mode: process.env.MASTERS_MODE,
  runtimeRoot: process.env.MASTERS_RUNTIME_ROOT,
  siteVariant: process.env.SITE_VARIANT
};

async function loadConfigWithEnv(overrides?: { dbPath?: string; runtimeRoot?: string; siteVariant?: string; mode?: string }) {
  if (overrides?.mode) {
    process.env.MASTERS_MODE = overrides.mode;
  } else {
    delete process.env.MASTERS_MODE;
  }

  if (overrides?.dbPath) {
    process.env.DB_PATH = overrides.dbPath;
  } else {
    delete process.env.DB_PATH;
  }

  if (overrides?.runtimeRoot) {
    process.env.MASTERS_RUNTIME_ROOT = overrides.runtimeRoot;
  } else {
    delete process.env.MASTERS_RUNTIME_ROOT;
  }

  if (overrides?.siteVariant) {
    process.env.SITE_VARIANT = overrides.siteVariant;
  } else {
    delete process.env.SITE_VARIANT;
  }

  vi.resetModules();
  return (await import("@/lib/config")).config;
}

afterEach(() => {
  process.env.DB_PATH = originalEnv.dbPath;
  process.env.MASTERS_MODE = originalEnv.mode;
  process.env.MASTERS_RUNTIME_ROOT = originalEnv.runtimeRoot;
  process.env.SITE_VARIANT = originalEnv.siteVariant;
  vi.resetModules();
});

describe("config runtime mode resolution", () => {
  it("uses the live 2026 defaults regardless of prior mode settings", async () => {
    const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "masters-mode-config-"));

    const config = await loadConfigWithEnv({
      runtimeRoot,
      mode: "rosterSandbox",
      siteVariant: "submission"
    });

    expect(config.appMode).toBe("live");
    expect(config.siteVariant).toBe("full");
    expect(config.dbPath).toBe(path.join(process.cwd(), "data", "db.json"));
  });

  it("prefers an explicit DB_PATH over the live default path", async () => {
    const runtimeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "masters-mode-config-"));
    const explicitDbPath = path.join(runtimeRoot, "custom.json");
    const config = await loadConfigWithEnv({
      dbPath: explicitDbPath,
      runtimeRoot,
      mode: "leaderboardSandbox",
      siteVariant: "submission"
    });

    expect(config.appMode).toBe("live");
    expect(config.siteVariant).toBe("full");
    expect(config.dbPath).toBe(explicitDbPath);
  });
});
