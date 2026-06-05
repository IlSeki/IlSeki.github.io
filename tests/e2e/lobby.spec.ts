import { test, expect } from "@playwright/test";

test.describe("Lobby Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/lobby");
  });

  test("successfully loads the lobby setup layout", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("RACE LOBBY");
  });

  test("allows entering a player and lists them in registered runners", async ({ page }) => {
    // Fill input field
    const nameInput = page.getByPlaceholder("e.g. Rizzler, Sigma");
    await nameInput.fill("Kai Cenat");
    
    // Trigger submission
    await page.click("button:has-text('ADD PLAYER')");

    // The name should appear listed in the roster
    await expect(page.locator("span:has-text('Kai Cenat')")).toBeVisible();
  });

  test("allows filling room slots with bots and enables race launcher", async ({ page }) => {
    // Add two bots to fulfill setup criteria
    await page.click("button:has-text('+ BOT')");
    await page.click("button:has-text('+ BOT')");

    const startButton = page.locator("button:has-text('START MAYHEM')");
    await expect(startButton).toBeEnabled();
  });
});
