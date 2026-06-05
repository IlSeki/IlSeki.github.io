import { test, expect } from "@playwright/test";

test.describe("Race Page E2E Tests", () => {
  test("successfully navigates from lobby to race page and renders canvas", async ({ page }) => {
    await page.goto("/lobby");
    
    // Roster 2 bots to unlock start button
    await page.click("button:has-text('+ BOT')");
    await page.click("button:has-text('+ BOT')");
    
    // Start
    await page.click("button:has-text('START MAYHEM')");
    
    // Verify routing
    await expect(page).toHaveURL(/\/race/);

    // Verify canvas renders
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });
});
