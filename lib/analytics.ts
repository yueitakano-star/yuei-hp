/**
 * Google Analytics 4 の読み込み可否。
 *
 * `NEXT_PUBLIC_*` はビルド時に文字列として埋め込まれるため、値そのものを
 * 検証してから使う（未設定・空文字・貼り間違いはすべて「計測しない」）。
 */

/** 判定に使う環境変数。テストから任意の組み合わせを渡せるようにする。 */
export type AnalyticsEnv = {
  NEXT_PUBLIC_GA_ID?: string;
  VERCEL_ENV?: string;
};

/** GA4 の測定ID（`G-` + 英大文字と数字）。UA-/GTM- や小文字は弾く。 */
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/;

/**
 * 読み込むべき GA4 測定ID。読み込まない場合は undefined。
 *
 * 本番デプロイ（`VERCEL_ENV === "production"`）でのみ有効にする。プレビュー
 * デプロイやローカル開発のアクセスを本番のレポートに混ぜないため。
 */
export function resolveGaId(env: AnalyticsEnv): string | undefined {
  if (env.VERCEL_ENV !== "production") return undefined;
  const id = env.NEXT_PUBLIC_GA_ID?.trim();
  return id && MEASUREMENT_ID.test(id) ? id : undefined;
}

/** 現在の実行環境で読み込む測定ID（読み込まないなら undefined）。 */
export const GA_ID = resolveGaId({
  // `process.env.X` の形で書かないとビルド時に値が埋め込まれない。
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  VERCEL_ENV: process.env.VERCEL_ENV,
});
