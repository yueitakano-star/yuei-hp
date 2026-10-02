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
    expect(keyakiUrl("http://web.yuei-japan.com")).toBeUndefined();
  });
});
