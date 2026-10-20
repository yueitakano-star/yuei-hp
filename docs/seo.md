# SEO・アクセス解析

最終更新: 2026-09-29

このサイトの検索まわり（ドメイン・計測・Search Console）の設定状況と、残っている作業。
コードを読んでも分からない「外部サービス側に何が設定されているか」を記録する。

## ドメイン構成

正規URL（canonical）は **apex の `https://yuei-japan.com`**。

| ホスト | 挙動 |
| --- | --- |
| `yuei-japan.com` | 200（実体を配信）|
| `www.yuei-japan.com` | 308 → `https://yuei-japan.com/` |
| `yuei-hp-navy.vercel.app` | 308 → `https://yuei-japan.com/` |

- ドメインは Vercel で取得（登録: 2026-09-29、有効期限: 2027-09-29）。ネームサーバーも Vercel（`ns1/ns2.vercel-dns.com`）なので、**DNS レコードは `vercel dns` で操作できる**。
- www と vercel.app のリダイレクトは Vercel のプロジェクト側の設定であり、リポジトリのコードには無い。`next.config.ts` には何も書いていない。
- この設定は Vercel CLI の `domains` サブコマンドでは変更できない。`vercel api` を使う:

```bash
# 現状確認
vercel api /v9/projects/yuei-hp/domains --scope yuei1 --raw

# 変更（body は JSON ファイルで渡す）
# {"redirect":"yuei-japan.com","redirectStatusCode":308} / 解除は {"redirect":null}
vercel api /v9/projects/yuei-hp/domains/<ホスト名> -X PATCH --input body.json --scope yuei1
```

> リダイレクトの向きを変えるときは、**先に転送先にしたいホストの redirect を外してから**、もう一方に redirect を設定する。逆順にするとループする瞬間ができる。

## Google アナリティクス 4

- 測定ID: `G-GWT185GS4G`（ページのソースに出る公開情報）
- Vercel の環境変数 `NEXT_PUBLIC_GA_ID` に設定済み。**Production のみ**。
- 実装は `lib/analytics.ts` と `components/analytics/site-analytics.tsx`。判定は `resolveGaId()` に集約してあり、テストは `tests/analytics.test.ts`。
  - 未設定・空文字・`UA-`/`GTM-`・小文字などの形式違いは、すべて「計測しない」に倒す。
  - `VERCEL_ENV === "production"` のときだけ読み込む。プレビューデプロイとローカル開発のアクセスは本番レポートに入らない。
- **ページビューは手動送信していない。** GA4 の拡張計測機能「ページの変更（ブラウザの履歴イベントに基づく）」がクライアント遷移を拾う。ここを手動送信に変えると二重計上になる（`node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` の "Tracking Pageviews"）。
  - つまり **GA4 管理画面で拡張計測機能をオフにすると、ページ遷移が計測されなくなる**。触らないこと。

## Google Search Console

- **ドメインプロパティ**として `yuei-japan.com` を登録済み（所有権確認は 2026-09-29 に完了）。
  - URLプレフィックスではなくドメインプロパティなので、`www` / apex / http / https を1つのプロパティでまとめて見られる。
- 所有権確認は DNS の TXT レコード。Vercel の DNS に入っている:

```
yuei-japan.com  TXT  google-site-verification=5QfApoBRXbRMjCdryTDj8dMpyP5AJzq-ul1yFDsaFYY
```

> このレコードは**消さないこと**。消すと所有権確認が外れる。

## 残タスク

優先度順。

1. **GA4 のリアルタイム計測を目視確認** — スマホで `https://yuei-japan.com` を開き、GA4 の「レポート → リアルタイム」にユーザーが出るか。広告ブロッカーが入っている環境では計測されないので注意。
2. **Search Console にサイトマップを送信** — 「サイトマップ」→ `sitemap.xml` を入力して送信。
3. **インデックス登録のリクエスト** — Search Console 上部の検索窓に `https://yuei-japan.com` を入れて「インデックス登録をリクエスト」。新規ドメインの初回インデックスを早める。
4. **Google ビジネスプロフィールの有無を確認** — `https://business.google.com/` にログインして、各店舗が登録済みか確認する。**未確認**（2026-09-29 時点）。店舗型の事業なので、ローカル検索では被リンクより効く。
5. **店舗の事実情報を記入して構造化データを出す** — 下記参照。

## 店舗の構造化データ（LocalBusiness）

`content/venues/**/*.mdx` に `address` が入っている店舗だけ `LocalBusiness` の JSON-LD が出る。住所が無い店舗には出さない（意図的な設計。`e2e/seo.spec.ts` がそれを検証している）。

| 店舗 | 住所 | 電話 | 営業時間 |
| --- | --- | --- | --- |
| オ酒ト定食ノ店 暖家 | ✅ | ✅ | ✅ |
| 立ち飲み屋DANKE | ✅ | ✅ | ✅（定休日なし）|
| 焼肉En | ❌ | ❌ | ❌ |
| KINGYO | ❌ | ❌ | ❌ |
| B-club | ❌ | ❌ | ❌ |
| C-girl | ❌ | ❌ | ❌ |

未記入の4店舗について、住所（ビル名・階まで）・電話番号・営業時間・定休日が分かれば記入する。

> **まとめサイトの情報をそのまま書かないこと。** 検索すると各種ポータルに住所や営業時間が出てくるが、古い情報や誤りが混ざる。AGENTS.md のとおり、事実情報は確認が取れたものだけ書く。

## 未決事項

- **KINGYO が独自サイト [newclub-kingyo.com](https://newclub-kingyo.com/) を持っている。** コーポレートサイトの `/business/nightlife/kingyo` と同じ店舗の情報で検索結果を取り合う形になる。どちらを主にするか（相互リンクするか、役割を分けるか）が未決。他店舗にも同様の単独サイトがあるかは未調査。

## 環境変数（Vercel Production）

| 名前 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://yuei-japan.com`。canonical / og:url / sitemap / robots / JSON-LD の起点（`lib/site.ts`）|
| `NEXT_PUBLIC_GA_ID` | `G-GWT185GS4G`。GA4 測定ID（`lib/analytics.ts`）|
| `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` | お問い合わせフォームの送信（Production / Preview）|

## 開発環境のメモ

- このマシンには `pnpm` が単体で入っていない。Node 同梱の corepack 経由で使う:

```bash
corepack pnpm install
corepack pnpm test
```

- Playwright の webServer は `pnpm build && pnpm start` を実行するため、`pnpm` に PATH が通っていないと `pnpm e2e` が単体では動かない。先に `corepack pnpm start -p 3100` を別プロセスで起動しておけば、`reuseExistingServer` が効いてそのまま `corepack pnpm e2e` が通る。
