import { repository } from "@/lib/data/repository";
import { config } from "@/lib/config";

export function verifyAdminPasscode(passcode: string) {
  return passcode === config.adminPasscode;
}
