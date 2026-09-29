import { describe, it, expect } from "vitest";
import { resolveGaId } from "@/lib/analytics";

const PROD = { VERCEL_ENV: "production" };

describe("resolveGaId", () => {
  it("本番で正しい測定IDが設定されていればそれを返す", () => {
    expect(resolveGaId({ ...PROD, NEXT_PUBLIC_GA_ID: "G-ABC1234567" })).toBe("G-ABC1234567");
  });

  it("測定IDの前後の空白を落とす", () => {
    expect(resolveGaId({ ...PROD, NEXT_PUBLIC_GA_ID: "  G-ABC1234567\n" })).toBe("G-ABC1234567");
  });

  it("測定IDが未設定なら undefined（スクリプトを読み込まない）", () => {
    expect(resolveGaId(PROD)).toBeUndefined();
  });

  it("測定IDが空文字・空白のみなら未設定として扱う", () => {
    expect(resolveGaId({ ...PROD, NEXT_PUBLIC_GA_ID: "" })).toBeUndefined();
    expect(resolveGaId({ ...PROD, NEXT_PUBLIC_GA_ID: "   " })).toBeUndefined();
  });

  it("GA4 の測定ID以外は受け付けない（UA・GTM・貼り間違い）", () => {
    for (const id of ["UA-12345678-1", "GTM-ABC1234", "ABC1234567", "G-", "G-abc1234567"]) {
      expect(resolveGaId({ ...PROD, NEXT_PUBLIC_GA_ID: id })).toBeUndefined();
    }
  });

  it("本番以外（プレビュー・ローカル開発）では測定IDがあっても読み込まない", () => {
    for (const env of [{ VERCEL_ENV: "preview" }, { VERCEL_ENV: "development" }, {}]) {
      expect(resolveGaId({ ...env, NEXT_PUBLIC_GA_ID: "G-ABC1234567" })).toBeUndefined();
    }
  });
});
