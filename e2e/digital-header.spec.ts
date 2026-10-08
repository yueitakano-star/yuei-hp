import { test, expect } from "@playwright/test";
import { watchErrors } from "./errors";

test("Web・広告制作: ページ上部に問い合わせボタンがあり、ケヤキクリエイトへのリンクは別タブで開く", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/business/digital");
  const header = page.getByTestId("page-header");
  await expect(header.getByRole("link", { name: "制作のご相談" })).toHaveAttribute("href", "/contact?type=web");

  // Shown only when NEXT_PUBLIC_KEYAKI_URL is an https origin (not set in the e2e build).
  const keyaki = header.getByTestId("keyaki-link");
  if (await keyaki.count()) {
    await expect(keyaki).toHaveAttribute("href", /^https:\/\//);
    await expect(keyaki).toHaveAttribute("target", "_blank");
    await expect(keyaki).toHaveAttribute("rel", /noopener/);
  }
  expect(errors()).toEqual([]);
});

test("他の事業ページのヘッダーには、ケヤキクリエイトのボタンが出ない", async ({ page }) => {
  await page.goto("/business/dining");
  await expect(page.getByTestId("page-header").getByTestId("keyaki-link")).toHaveCount(0);
  await expect(page.getByTestId("page-header").getByRole("link", { name: "制作のご相談" })).toHaveCount(0);
});
