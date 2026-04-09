import { hasRoleSession } from "@/lib/security/cookies";

export async function requireAdminSession() {
  const allowed = await hasRoleSession("admin");
  if (!allowed) {
    throw new Error("Admin session required.");
  }
}
