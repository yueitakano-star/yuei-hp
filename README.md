# 遊栄JAPAN コーポレートサイト

遊栄JAPAN のコーポレートサイト。Next.js (App Router) + Tailwind CSS v4 + shadcn/ui + Motion で構築。

Corporate website for 遊栄JAPAN (Yuei Japan), built with Next.js (App Router), Tailwind CSS v4, shadcn/ui, and Motion.

## スタック / Stack

- Next.js 16 (App Router, Turbopack)
- React 19 / TypeScript
- Tailwind CSS v4 + shadcn/ui
- Motion (animation) + Lenis (smooth scroll)
- Vitest (unit) / Playwright (e2e)

## セットアップ / Setup

```bash
pnpm install
pnpm dev
```

## 検証コマンド / Checks

PR を出す前に、以下をすべて通してください / run all of these before opening a PR:

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e
```

## ホスティング / Hosting

| 項目 | 値 |
|---|---|
| GitHub | https://github.com/yueitakano-star/yuei-hp （2026-09-28 に `rocken318/yuei-hp` から移行） |
| Vercel | `yueitakano-star/yuei-hp` を Import したプロジェクト（`main` への push で本番、PR ごとにプレビューを自動デプロイ） |
| 本番 URL | https://yuei-hp-navy.vercel.app （独自ドメイン未設定） |

- 旧 Vercel プロジェクト（ken's projects / `yuei-hp`、`yuei-hp.vercel.app`）と旧リポジトリは移行前のもの。新環境の本番公開を確認したら削除してよい。
- 開発フロー: ブランチ → PR → CI（GitHub Actions）＋ Vercel プレビュー確認 → `main` へマージ。`main` へ直接コミットしない（[`AGENTS.md`](./AGENTS.md)）。
- 環境変数は Vercel の Settings → Environment Variables で管理する。一覧と意味は [`.env.example`](./.env.example)。

## 本番公開チェックリスト / Production launch checklist

Vercel の本番環境（Production）に公開する前に確認する。

- [ ] `NEXT_PUBLIC_SITE_URL` を本番ドメインに設定（未設定だと canonical / sitemap / JSON-LD が `https://yuei-hp-navy.vercel.app` を指す。ビルド時に警告が出る）
- [ ] お問い合わせメール: `RESEND_API_KEY` / `CONTACT_TO` / `CONTACT_FROM` の 3 つをすべて設定（どれか欠けるとフォームは「準備中」表示のまま）
  - [ ] 送信元ドメインを Resend でドメイン認証（SPF / DKIM）し、`CONTACT_FROM` はそのドメインのアドレスにする（`onboarding@resend.dev` はアカウント所有者にしか届かない）
  - [ ] 本番でテスト送信し、`CONTACT_TO` に届くことを確認
- [ ] TODO: フォームのスパム対策（レート制限 / Cloudflare Turnstile など）を導入
- [ ] 会社情報の事実確認・記入: `content/company.json`（住所・連絡先など）と各店舗・設置場所 `content/venues/**/*.mdx`（住所・営業時間など）。不明な項目は推測で埋めない
- [ ] 代表あいさつ（`content/company.json` の `greeting`、`draft: true`）の文面承認を得て `draft` を外す（本番では draft は非表示）
- [ ] プライバシーポリシーの法務確認（`app/privacy/page.tsx` の `TODO(legal)`）

## アセット生成 / Asset pipeline

`assets-pipeline/` 配下のスクリプトで、原本写真から Web 用アセットを生成する。

```bash
pnpm assets:source                       # 原本画像 (images/) を最適化して取り込む
ASSETS_GEN_CONCURRENCY=2 pnpm assets:gen <briefId...>   # 依頼書からアセットを生成（並列数は環境変数で指定、既定 2）
pnpm assets:adopt <briefId> <vN>         # 生成済みバージョンを採用して public/ へ反映
```

## ドキュメント / Docs

- [`AGENTS.md`](./AGENTS.md) — Claude / Codex 共通の開発規約
- [`docs/superpowers/specs`](./docs/superpowers/specs) — 設計書
- [`docs/superpowers/plans`](./docs/superpowers/plans) — 実装計画
