import { execSync } from "node:child_process";
import fs from "node:fs";

const tsconfigPath = new URL("../tsconfig.json", import.meta.url);
const original = fs.readFileSync(tsconfigPath, "utf8");
const parsed = JSON.parse(original);

parsed.include = (parsed.include ?? []).filter((entry) => entry !== ".next/types/**/*.ts");

fs.writeFileSync(tsconfigPath, `${JSON.stringify(parsed, null, 2)}\n`);

try {
  execSync("tsc --noEmit", { stdio: "inherit" });
} finally {
  fs.writeFileSync(tsconfigPath, original);
}
