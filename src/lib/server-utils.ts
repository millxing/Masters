import crypto from "node:crypto";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateEditToken() {
  return crypto.randomBytes(24).toString("base64url");
}
