import { test, expect } from "@playwright/test";
import { watchErrors } from "./errors";

const portal = (page: import("@playwright/test").Page) => page.getByTestId("vision-portal").locator("section");

test("遊栄ビジョン: VISION の文字へ入ると LED 訴求が現れる", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/business/signage");
  const section = portal(page);
  await expect(section).toHaveAttribute("data-gp-ready", "true");
  await expect(section).toHaveAttribute("data-gp-motion", "on");

  const heading = page.getByRole("heading", { name: "夜の国分町で、広告が自ら光る。" });
  await section.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
  await expect(section).toHaveAttribute("data-gp-entered", "false");

  // Past the travel (1.8 viewports) the camera is inside the letter and the content is opaque.
  await section.evaluate((el) =>
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + innerHeight * 2.4),
  );
  await expect(section).toHaveAttribute("data-gp-entered", "true");
  await expect(heading).toBeVisible();
  await expect(page.getByTestId("led-appeal")).toBeVisible();
  expect(errors()).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("遊栄ビジョン: 静止したまま LED 訴求を読める", async ({ page }) => {
    await page.goto("/business/signage");
    const section = portal(page);
    await expect(section).toHaveAttribute("data-gp-motion", "off");
    const heading = page.getByRole("heading", { name: "夜の国分町で、広告が自ら光る。" });
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
  });
});
