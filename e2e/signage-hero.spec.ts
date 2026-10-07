import { test, expect } from "@playwright/test";
import { watchErrors } from "./errors";

test("遊栄ビジョン: ヒーローは LED ドットで点灯し、スクロールしなくても写真になる", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/business/signage");
  await expect(page.getByRole("heading", { level: 1, name: "遊栄ビジョン" })).toBeVisible();
  const field = page.getByTestId("led-dot-field");
  await expect(field).toHaveAttribute("data-led-mode", "dots");
  // Sweep + hold + resolve is about 3 seconds on a timer, no scrolling.
  await expect(field).toHaveAttribute("data-led-resolved", "true", { timeout: 10_000 });
  await expect(field.locator("img")).toHaveCSS("opacity", "1");
  expect(errors()).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("遊栄ビジョン: ドットは描かず、写真をそのまま見せる", async ({ page }) => {
    await page.goto("/business/signage");
    const field = page.getByTestId("led-dot-field");
    await expect(field).toHaveAttribute("data-led-mode", "static");
    await expect(field.locator("canvas")).toHaveCSS("opacity", "0");
    await expect(field.locator("img")).toHaveCSS("opacity", "1");
    await expect(page.getByRole("heading", { level: 1, name: "遊栄ビジョン" })).toBeVisible();
  });
});
