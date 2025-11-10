import { test, expect } from "@playwright/test";

test("トップページが開けること", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ちょこっと/i);
});
