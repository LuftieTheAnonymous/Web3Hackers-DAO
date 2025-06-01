import dotenv from "dotenv";
dotenv.config();

import { CronJob } from "cron";

export const monthlyContributionJob = new CronJob("0 0 1 * *", async () => {
  try {
    console.log("monthlyContributionJob is running");

    const response = await fetch("http://localhost:2137/gov_token/monthly_token_distribution", {
      method: "GET",
      headers: {
        "x-backend-eligibility": process.env.CRONJOBS_INTERNAL_SECRET!,
      },
    });

    const data = await response.json();
    console.log("Distribution Result", data);
  } catch (e) {
    console.error("Cron job error:", e);
  }
}, () => {
  console.log("monthlyContributionJob is completed");
});