import { test, expect } from "@playwright/test";

test.describe("Leaderboard Page E2E Tests", () => {
  test("renders the global leaderboard page and records table", async ({ page }) => {
    await page.goto("/leaderboard");

    // Title checks
    await expect(page.locator("h2")).toContainText("GLOBAL RECORDS");

    // Table checks
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });
});
