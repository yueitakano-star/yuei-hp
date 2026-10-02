# 事業再編（サブ1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 本体サイトの事業を Web・広告制作 → サイネージ → 飲食 → ナイトの順に並べ替え、Web・広告制作事業を「ケヤキクリエイト」ブランドで前面に出し、国分町色を指定範囲で外す。

**Architecture:** 事業の並びと名称は `content/businesses/*.json` と `content/company.json` のデータだけで変える（slug 不変）。コピーは該当コンポーネントの文言を置換する。ケヤキクリエイトへのリンクは `NEXT_PUBLIC_KEYAKI_URL` が設定されたときだけ表示する。

**Tech Stack:** Next.js 16（App Router）、TypeScript、Vitest、Playwright、pnpm。

**Spec:** `docs/superpowers/specs/2026-10-02-business-reorder-design.md`

## Global Constraints

- main へ直接コミットしない（ブランチ → PR → CI → プレビュー確認 → マージ）。
- 色・フォント・角丸は `app/globals.css` のトークンだけを使う。モーション値は `lib/motion.ts` のみ。
- 事実情報を推測で書かない。実績・料金・制作事例を作らない。
- `slug` は変更しない（URL 互換）。`titleDisplay` から `|` を除いた文字列は `brand ?? name` と一致させる。
- 「国分町」を維持する箇所: 会社住所、サイネージ事業（概要・設置場所・トップのサイネージ節）、ナイト事業、店舗ページ。外す箇所: Web・広告制作事業、飲食事業、理念、トップのヒーロー・メッセージ・数字、会社概要の導入、事業一覧の導入、サイト全体のメタ情報・OG 画像。
- 検証: `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`

## Review Focus

- `businessSummary` と事業 `name` の不一致（`tests/content/real-content.test.ts` が同値を要求）。
- `NEXT_PUBLIC_KEYAKI_URL` 未設定で、空リンクや `undefined` が画面に出ないこと。
- `titleDisplay` の `|` 除去結果がブランド名と一致しないとスキーマで落ちること。
- 国分町を外した後にテスト（OG alt、理念タイトル）が古い文言で落ちること。
- 事業の並び替えでトップのプリズム・マーキー・事業一覧の順が変わること。

---

### Task 1: 事業の並びとケヤキクリエイト化（データ）

**Files:**
- Modify: `content/businesses/digital.json`, `signage.json`, `dining.json`, `nightlife.json`（`order`）、`content/company.json`（`businessSummary`）
- Test: `tests/content/real-content.test.ts`

**Interfaces:**
- Produces: `getBusinesses()` が `["digital","signage","dining","nightlife"]` の順で返る。digital は `name: "Web・広告制作事業"`, `brand: "ケヤキクリエイト"`, `brandEn: "KEYAKI CREATE"`, `titleDisplay: "ケヤキ|クリエイト"`。

- [ ] **Step 1: テストを先に更新する** — `tests/content/real-content.test.ts` の並び期待値を `["digital", "signage", "dining", "nightlife"]` にし、`philosophy.title` の期待値を `"仙台から、街と企業の未来へ。"` にする。digital の brand と order を確認するテストを追加する。

```ts
it("Web・広告制作事業は先頭で、ケヤキクリエイトのブランドを持つ", async () => {
  const [first] = await content.getBusinesses();
  expect(first.slug).toBe("digital");
  expect(first.name).toBe("Web・広告制作事業");
  expect(first.brand).toBe("ケヤキクリエイト");
  expect(first.brandEn).toBe("KEYAKI CREATE");
});
```

- [ ] **Step 2: 落ちることを確認** — `pnpm test tests/content/real-content.test.ts`。Expected: FAIL。
- [ ] **Step 3: データを更新する** — order を digital 1 / signage 2 / dining 3 / nightlife 4 にする。digital.json の名称・summary・lead・description・services・flow を Web・広告制作向けに書き換える（国分町なし）。`company.json` の `businessSummary` を `["Web・広告制作事業","デジタルサイネージ事業","飲食事業","ナイトエンターテインメント事業"]` にし、理念と greeting（draft 維持）から国分町を外す。
- [ ] **Step 4: 通ることを確認** — `pnpm test`。Expected: PASS（他のテストの落ちは Task 2 で直す）。
- [ ] **Step 5: Commit** — `git commit -m "feat(content): 事業の並びを Web・広告制作先頭に変更しケヤキクリエイトを追加"`

### Task 2: コピーの国分町除去

**Files:**
- Modify: `components/sections/home/hero.tsx`, `message.tsx`, `numbers.tsx`; `app/layout.tsx`, `app/about/page.tsx`, `app/business/page.tsx`, `app/opengraph-image.tsx`, `lib/seo/metadata.ts`
- Test: `tests/effects/word-reveal.test.ts`（独自リテラルのため変更不要）、e2e の文言参照

**Interfaces:**
- Consumes: Task 1 の理念文言 `仙台から、街と企業の未来へ。`。

- [ ] **Step 1: 文言を置換する** — ヒーロー見出し「仙台から、つくる。伝える。」、サブ「Web・広告制作、デジタルサイネージ、飲食、エンターテインメントへ。仙台から、領域を越えて。」。メッセージ 1 行目を理念文に、3 行目を「Web・広告制作、デジタルサイネージ、飲食、そしてエンターテインメント。」にする。numbers の補足を「仙台を拠点に、領域を越えて。」にする。layout・about・business・OG（TAGLINE と `OG_IMAGE_ALT`）の「国分町」を「仙台」に、事業の並びを新しい順にする。
- [ ] **Step 2: 国分町の残存確認** — `grep -rn "国分町" app components lib content` の出力が、維持対象（住所、サイネージ、ナイト、recruit のナイト言及）だけであること。
- [ ] **Step 3: テスト** — `pnpm typecheck && pnpm lint && pnpm test`。Expected: PASS。
- [ ] **Step 4: Commit** — `git commit -m "feat(copy): 仙台軸のコピーに変更し国分町表記を整理"`

### Task 3: ケヤキクリエイトへの導線（環境変数で有効化）

**Files:**
- Modify: `lib/site.ts`, `app/business/[business]/page.tsx`, `components/sections/home/cta.tsx`
- Create: `lib/keyaki.ts`
- Test: `tests/site/keyaki.test.ts`

**Interfaces:**
- Produces: `keyakiUrl(env?: string): string | undefined` — 空文字・空白・未設定は `undefined`、末尾スラッシュを除いた URL を返す。

- [ ] **Step 1: テストを書く**

```ts
import { describe, it, expect } from "vitest";
import { keyakiUrl } from "@/lib/keyaki";

describe("keyakiUrl", () => {
  it("未設定・空・空白は undefined", () => {
    expect(keyakiUrl(undefined)).toBeUndefined();
    expect(keyakiUrl("")).toBeUndefined();
    expect(keyakiUrl("   ")).toBeUndefined();
  });
  it("末尾スラッシュを除く", () => {
    expect(keyakiUrl("https://web.yuei-japan.com/")).toBe("https://web.yuei-japan.com");
  });
  it("https 以外は undefined", () => {
    expect(keyakiUrl("javascript:alert(1)")).toBeUndefined();
  });
});
```

- [ ] **Step 2: 落ちることを確認** — `pnpm test tests/site/keyaki.test.ts`。Expected: FAIL（モジュールなし）。
- [ ] **Step 3: 実装** — `lib/keyaki.ts`:

```ts
/** Public origin of ケヤキクリエイト (web subdomain). Unset → the link is hidden. */
export function keyakiUrl(env: string | undefined = process.env.NEXT_PUBLIC_KEYAKI_URL): string | undefined {
  const v = env?.trim();
  if (!v || !/^https:\/\//.test(v)) return undefined;
  return v.replace(/\/+$/, "");
}
```

- [ ] **Step 4: 導線を置く** — digital の `CTA.actions` に、`keyakiUrl()` があるときだけ「ケヤキクリエイトを見る」を追加する（外部リンクは `<a target="_blank" rel="noopener">`、`BusinessCta` は `href` が `https:` のとき `<a>` で描画するよう分岐）。トップの `Cta` の問い合わせ入口に同様の条件付きカードを追加する。
- [ ] **Step 5: テスト** — `pnpm test`。Expected: PASS。
- [ ] **Step 6: Commit** — `git commit -m "feat: ケヤキクリエイトへの導線を環境変数で有効化できるようにする"`

### Task 4: 検証と PR

- [ ] **Step 1:** `pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e`。失敗は原因を直してから再実行する（並び順・文言に依存する e2e を更新）。
- [ ] **Step 2:** ブランチを push し、`gh pr create`。Vercel プレビューで事業の並び、トップ、事業ページ、会社概要を確認する。
- [ ] **Step 3:** 承認後にマージし、本番を `curl` で実測する（`/business` の並び、sitemap、トップの文言）。
