import cron from "node-cron";
import { cleanupDeletedAccounts } from "./cleanUpDeletedUser.js";

export function startAccountCleanupCron() {

  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        `[${new Date().toISOString()}] Running account cleanup...`
      );

      await cleanupDeletedAccounts();
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  });
}