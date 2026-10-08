import { test, expect } from "@playwright/test";
import { watchErrors } from "./errors";

test("Web・広告制作: 制作イメージ（チラシ・Webバナー・SNSバナー）が架空のサンプルと明記されて表示される", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/business/digital");
  const section = page.getByTestId("works-samples");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("heading", { name: "制作イメージ" })).toBeVisible();
  await expect(section).toContainText("架空のお店を想定");
  await expect(section).toContainText("実在のお店や実績ではありません");

  for (const name of [/チラシのサンプル/, /Webバナーのサンプル/, /SNSバナーのサンプル/]) {
    const img = section.getByRole("img", { name });
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    // The artwork really loaded (not a broken image).
    expect(await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
  await expect(section.getByText("SAMPLE", { exact: true })).toHaveCount(3);
  expect(errors()).toEqual([]);
});
