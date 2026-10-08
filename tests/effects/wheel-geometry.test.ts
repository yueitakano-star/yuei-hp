import { describe, it, expect } from "vitest";
import {
  activeItem,
  bowAt,
  cardState,
  CULL,
  place,
  progressForItem,
  turnAt,
  wheelMetrics,
} from "@/lib/effects/wheel-geometry";

describe("turnAt", () => {
  it("端は 0 と count", () => {
    expect(turnAt(0, 6)).toBe(0);
    expect(turnAt(1, 6)).toBe(6);
    expect(turnAt(-1, 6)).toBe(0);
    expect(turnAt(2, 6)).toBe(6);
  });
  it("p = k / count でちょうど k（各アイテムが手前に来る）", () => {
    for (let k = 0; k <= 6; k++) expect(turnAt(k / 6, 6)).toBeCloseTo(k);
  });
  it("単調に増え、整数の近くでは進みが遅い（止まって見える）", () => {
    let prev = -1;
    for (let i = 0; i <= 600; i++) {
      const t = turnAt(i / 600, 6);
      expect(t).toBeGreaterThanOrEqual(prev);
      prev = t;
    }
    const near = turnAt(3 / 6 + 0.002, 6) - turnAt(3 / 6, 6);
    const mid = turnAt(3 / 6 + 0.5 / 6 + 0.001, 6) - turnAt(3 / 6 + 0.5 / 6, 6);
    expect(near).toBeLessThan(mid / 10);
  });
});

describe("progressForItem", () => {
  it("そのアイテムが手前に来る進捗", () => {
    for (let i = 0; i < 6; i++) {
      expect(activeItem(turnAt(progressForItem(i, 6), 6), 6)).toBe(i);
      expect(turnAt(progressForItem(i, 6), 6)).toBeCloseTo(i + 1);
    }
  });
});

describe("cardState", () => {
  it("リングでは全部見え、ドラムでは手前から CULL 以内だけ見える", () => {
    for (let i = 0; i < 6; i++) expect(cardState(i, 0, 6).hidden).toBe(false);
    expect(cardState(0, 1, 6).hidden).toBe(false);
    expect(cardState(1, 1, 6).hidden).toBe(false);
    expect(cardState(2, 1, 6).hidden).toBe(true);
    expect(Math.abs(cardState(3, 4, 6).d)).toBeLessThan(CULL);
  });
  it("手前のカードは最前面（z が最大）", () => {
    expect(cardState(2, 3, 6).z).toBeGreaterThan(cardState(3, 3, 6).z);
    expect(cardState(2, 3, 6).z).toBeGreaterThan(cardState(1, 3, 6).z);
  });
});

describe("place / bowAt", () => {
  it("手前のカード（ドラム）は弓なりに動かない", () => {
    expect(bowAt(0, 100)).toBeCloseTo(0);
    expect(bowAt(40, 100)).toBeLessThan(0);
  });
  it("ring (m=0) ではドラムの項が 0、drum (m=1) ではリングの項が 0", () => {
    expect(place(30, 40, 100, 200, 80, 0)).toContain("rotateX(0deg) translateZ(0px)");
    expect(place(30, 40, 100, 200, 80, 1)).toContain("rotateZ(0deg) translateY(0px)");
  });
});

describe("wheelMetrics", () => {
  it("カードは比率 1.45 で、ステージの幅を超えない", () => {
    const wide = wheelMetrics(1280, 800, 6);
    expect(wide.cardW / wide.cardH).toBeCloseTo(1.45);
    expect(wide.cardW).toBeLessThanOrEqual(1280 * 0.34 + 1e-6);
    const phone = wheelMetrics(390, 780, 6);
    expect(phone.cardW).toBeLessThanOrEqual(390 * 0.72 + 1e-6);
    expect(phone.cardW).toBeGreaterThan(wide.cardW * 0.5);
  });
  it("リングは高さにも収まる（固定ヘッダー分の余白つき）", () => {
    const pc = wheelMetrics(1280, 800, 6);
    const reachY = (pc.ringR + (pc.cardH * pc.ringScale) / 2) * pc.ringFit;
    expect(reachY).toBeLessThanOrEqual(400 * 0.78 + 1e-6);
  });
  it("狭いステージでは、リングが幅に収まるよう全体を縮める", () => {
    const phone = wheelMetrics(390, 780, 6);
    expect(phone.ringFit).toBeLessThan(1);
    const extent = (phone.ringR + (phone.cardW * phone.ringScale) / 2) * phone.ringFit;
    expect(extent).toBeLessThanOrEqual(195);
  });
});
