# C-girlカードから公式店舗サイトへ直接移動

ユーザー依頼: C-girlのカードから直接店舗ページへ移動できるようにする。

ナイトエンターテインメントの店舗一覧、採用情報、他店舗の関連カードのC-girlリンクを、コンテンツの `siteUrl` に直接つなぐ。既存の紹介ページはURLを維持。公式サイトへのカードは「公式サイトを見る」と外向き矢印を表示し、同じタブで移動する。他店舗の行き先は維持する。

変更対象:
- `lib/page/venue-link.ts`
- `components/page/venue-card.tsx`
- `app/business/[business]/page.tsx`
- `app/business/[business]/[venue]/page.tsx`
- `app/recruit/page.tsx`
- `e2e/contact.spec.ts`（旧仕様の内部リンク件数チェックを更新）
- この依頼書

検証: typecheck、lint、test、build、CI E2E。プレビューでC-girlカードの行き先とクリックによる公式サイトへの遷移を確認。
