import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "masters-pool-tests-"));
process.env.DB_PATH = path.join(tempDir, "db.json");
