import cron from "node-cron";
import { cleanupDeletedAccounts } from "./cleanUpDeletedUser.js";

console.log("Starting cleanup cron...");

export function startAccountCleanupCron() {
  console.log("Account cleanup cron started");

  cron.schedule("0 * * * *", async () => {
    try {
      console.log(
        `[${new Date().toISOString()}] Running account cleanup...`
      );

      await cleanupDeletedAccounts();

      console.log("Cleanup completed");
    } catch (err) {
      console.error("Cleanup failed:", err);
    }
  });
}