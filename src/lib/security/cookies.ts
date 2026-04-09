import crypto from "node:crypto";
import { cookies } from "next/headers";
import { config } from "@/lib/config";

function sign(value: string) {
  return crypto.createHmac("sha256", config.cookieSecret).update(value).digest("hex");
}

function encodeSession(role: "admin") {
  const payload = `${role}:authorized`;
  return `${payload}.${sign(payload)}`;
}

function decodeSession(raw: string | undefined, role: "admin") {
  if (!raw) return false;
  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  if (payload !== `${role}:authorized`) return false;
  return sign(payload) === signature;
}

export async function createRoleSession(role: "admin") {
  const jar = await cookies();
  jar.set(`masters_${role}`, encodeSession(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function hasRoleSession(role: "admin") {
  const jar = await cookies();
  return decodeSession(jar.get(`masters_${role}`)?.value, role);
}
