import { test, expect } from "@playwright/test";

// 測定IDは Vercel の本番環境変数（NEXT_PUBLIC_GA_ID）だけに置く。ローカルや CI の
// ビルドでは未設定なので、GA のスクリプトは一切出ないのが正しい状態。ID をコードに
// 直書きしてしまった場合や、本番以外でも読み込む作りに変わった場合にここで落ちる。
test("測定IDが無いビルドでは Google Analytics を読み込まない", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  const html = await page.content();
  expect(html).not.toContain("gtag(");
});
