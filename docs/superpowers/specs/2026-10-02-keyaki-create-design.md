# ケヤキクリエイト（web.yuei-japan.com）設計書

- 作成日: 2026-10-02
- 前提設計: 2026-10-02-business-reorder-design.md（サブ1。本書はサブ2）
- ステータス: ドラフト（ユーザーレビュー待ち）

## 0. 目的と成功基準

仙台の企業・店舗向けに、ホームページ制作・動画／静止画の広告物・Webシステム開発を受注するサイト「ケヤキクリエイト」を `https://web.yuei-japan.com` で公開する。毎日Web・AI関連の記事が自動で増え、サンプル制作物が見られる。

成功基準:
- `https://web.yuei-japan.com` が HTTP 200 で表示され、sitemap・robots・canonical が正しい。
- 本体 `yuei-japan.com` の事業ページとトップに、ケヤキクリエイトへの導線が出る（`NEXT_PUBLIC_KEYAKI_URL` を設定し再デプロイ。表示は実測で確認）。
- 日次記事が、人手なしで検証を通った分だけ公開される。記事は一次情報の URL つきで、実在しない URL や重複は公開されない。
- サンプル制作物は「SAMPLE」と明記され、実績と誤認されない。

## 1. 決定事項（確定済み）

- 位置づけ: 遊栄JAPANの Web・広告制作事業の受注サイト。ブランド名は「ケヤキクリエイト / KEYAKI CREATE」で、ヘッダー・ロゴ・本文に「遊栄」を出さない。運営会社は会社概要ページ（`/company`）と問い合わせ・プライバシー等の法的に必要な箇所のみに記載する。
- 作り方（A1）: 遊栄専用の新規 Next.js サイト。`halvision-tech`（halvision.dev）から仕組みだけを移植し、記事は新規に書く。halvision.dev と記事を重複させない。
- ドメイン: 当面は `web.yuei-japan.com`。独自ドメイン移行に備え、公開 URL は環境変数 `NEXT_PUBLIC_SITE_URL` で切り替える。
- 軸: 仙台 × Web制作・広告制作。「国分町」「夜の街」の色は出さない。

## 2. 構成

### 2.1 リポジトリとホスティング
- 新規 GitHub リポジトリ `yueitakano-star/keyaki-create`、ローカルは `E:\Homepage\webbuild\keyaki-create`。
- Vercel: 既存チーム `yuei1` に新規プロジェクト。`web.yuei-japan.com` を追加（`yuei-japan.com` の DNS は Vercel 管理のため、レコードは自動）。
- 技術: Next.js（本体と同じバージョン系列）、TypeScript、Tailwind CSS v4、motion、MDX（記事）、Vitest、Playwright。全ページ SSG。AGENTS.md 相当の規約（トークン、モーション、`prefers-reduced-motion`、ホバー代替）は本体から踏襲する。

### 2.2 ページ
| パス | 内容 |
|---|---|
| `/` | ヒーロー、サービス概要、サンプル抜粋、最新記事、問い合わせ導線 |
| `/services` | ホームページ制作、動画・静止画の広告物、Webシステム・AI活用、運用・改善（本体の事業ページと整合） |
| `/works` | サンプル制作物一覧（すべて SAMPLE と明記）。詳細は `/works/[slug]` |
| `/price` | 料金。確定していない金額は書かず「要相談」とする |
| `/blog` | 記事一覧・詳細（`/blog/[slug]`）、カテゴリ（Web / AI）、日付別 |
| `/contact` | 問い合わせ。当面は本体 `yuei-japan.com/contact?type=web` へ誘導する |
| `/company` | 運営会社（遊栄Japan株式会社。社名・住所は本体の `company.json` の事実情報のみ） |

### 2.3 デザイン
欅（ケヤキ）をモチーフにした独自の配色（深緑を主、暖色アクセント）。遊栄本体のトークンは使わない。ロゴは新規に作る（SVG）。写真・イメージは Codex 画像生成と Photoshop で制作する。

## 3. 日次記事の自動生成

- 実行: このPCのタスクスケジューラが毎朝 `scripts/daily/run.ps1` を起動し、Claude Code をヘッドレスで実行する（`halvision-tech/scripts/daily-news/run.ps1` と同方式。API キー不要）。
- 生成: 前日〜当日のWeb・AI関連の実ニュースを調べ、**仙台の中小企業・店舗の視点**で「概要・解説・実務での使いどころ」を書く（日本語のみ）。1日 1〜3 本。ベンダー中立で、誇張表現を避ける。一次情報の URL を必ず付ける。
- 保存: `content/articles/<YYYY-MM-DD>-<slug>.mdx`（frontmatter: title, date, category, sources[], summary）。
- 検証（公開前の自動チェック。失敗した記事は公開せず、ログに残す）:
  1. スキーマ（zod）検証
  2. `sources` の URL が実在する（HEAD/GET で 2xx）
  3. 既存記事とのタイトル・URL の重複なし
  4. 日付が当日±1日（古いニュースの再掲を防ぐ）
- 公開: 検証を通った記事ファイルだけを `main` に commit・push し、Vercel が自動デプロイする。bot が触るのは `content/articles/**` のみ。
- 失敗時: ログ（`scripts/daily/logs/`）に残し、記事なしの日は更新しない。

## 4. サンプル制作物

- 種類: バナー、チラシ風の静止画、短い動画素材（ループ）、サンプルサイト（1〜2 業種、例: 飲食店・美容室）。
- 制作: Codex 画像生成（imagegen）と Photoshop。サンプルサイトは本リポジトリ内の `/works/sample-*` として実装する。
- 表示: すべて「SAMPLE」バッジを付け、実績・お客様の声と誤認させない。実在の店舗名・人物・ロゴは使わない。
- 事実: 実績数、料金、お客様の声は作らない。

## 5. SEO と法的表記

- sitemap・robots・canonical・JSON-LD（Organization、Article、BreadcrumbList）。記事はカテゴリ・日付で内部リンクする。地域×業種の量産ページは作らない（doorway 回避）。
- プライバシーポリシーは本体の内容と整合させ、`/company` に運営者を記載する。

## 6. 本体との連携

- 本体の PR #7 は `NEXT_PUBLIC_KEYAKI_URL` で導線を出し分ける。サブ2の公開確認後、Vercel CLI で本体プロジェクトの Production と Preview に `https://web.yuei-japan.com` を設定して再デプロイし、curl でリンクの表示を実測する。

## 7. テスト

- Vitest: 記事スキーマ、重複検出、URL 検証ロジック（ネットワークはモック）。
- Playwright: 主要ページの表示、記事一覧・詳細、SAMPLE バッジ、コンソールエラーなし。
- 公開前: `typecheck && lint && test && build && e2e`。公開後: `web.yuei-japan.com` と本体への curl 実測。

## 8. 進行順

1. 本書の承認
2. サブ2の実装計画（writing-plans）
3. リポジトリ作成・Vercel プロジェクト・ドメイン設定・雛形
4. ページ実装、サンプル制作、日次記事の生成と検証スクリプト
5. タスクスケジューラ登録、初回の記事を手動実行して公開確認
6. 本体への環境変数設定と再デプロイ、実測

## 9. 未決事項

1. サンプルサイトの業種（既定: 飲食店と美容室）。
2. 問い合わせ導線は当面、本体の問い合わせへ誘導。専用フォームが要る場合は別途（送信先メールアドレスが必要）。
3. 記事の頻度（既定: 毎日 1〜3 本）。
