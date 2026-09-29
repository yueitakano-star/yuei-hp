import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_ID } from "@/lib/analytics";

/**
 * GA4 (gtag.js)。測定IDが未設定、または本番デプロイ以外では何も出力しない
 * （判定は lib/analytics.ts）。
 *
 * ページビューは送らない。GA4 の拡張計測機能「ページの変更（ブラウザの履歴
 * イベントに基づく）」がクライアント遷移を拾うため、手動送信すると二重計上に
 * なる（node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md
 * の "Tracking Pageviews"）。
 */
export function SiteAnalytics() {
  if (!GA_ID) return null;
  return <GoogleAnalytics gaId={GA_ID} />;
}
