import { test, expect } from "@playwright/test";
import { watchErrors } from "./errors";

test("焼肉En: スクロールでホイールが開き、次の料理が手前に回る", async ({ page, isMobile }) => {
  const errors = watchErrors(page);
  await page.goto("/business/dining/en");
  const wheel = page.getByTestId("works-wheel");
  await expect(wheel).toBeVisible();
  await expect(wheel.locator("..")).toHaveAttribute("data-wheel", "on");

  const go = (progress: number) =>
    wheel.evaluate((node, p) => {
      const el = node as HTMLElement;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top + p * (el.offsetHeight - innerHeight));
    }, progress);
  const caption = wheel.locator("span.font-display").first();

  // Item k is at the front at p = (k + 1) / 6.
  await go(1 / 6);
  await expect(caption).toHaveText("01 / 06");
  await go(3 / 6);
  await expect(caption).toHaveText("03 / 06");
  await go(1);
  await expect(caption).toHaveText("06 / 06");

  if (!isMobile) {
    // The index jumps straight to an item.
    await wheel.getByRole("button", { name: "02" }).click();
    await expect(caption).toHaveText("02 / 06");
    await expect(wheel.getByRole("button", { name: "02" })).toHaveAttribute("aria-current", "true");
  }
  expect(errors()).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("焼肉En: ホイールは出さず、写真を静止した一覧で見せる", async ({ page }) => {
    await page.goto("/business/dining/en");
    await expect(page.getByTestId("works-wheel")).toBeHidden();
    const grid = page.getByRole("img", { name: /焼肉Enのお料理 \d/ });
    await expect(grid.first()).toBeAttached();
    expect(await grid.count()).toBeGreaterThanOrEqual(6);
  });
});
