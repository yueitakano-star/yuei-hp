import { describe, it, expect } from "vitest";
import { coverRect, dotRadius, gridSpec, luma, pointerBoost, rippleBoost, sweepLevel } from "@/lib/effects/led-grid";

describe("coverRect", () => {
  it("横長の画像は左右を切る", () => {
    expect(coverRect(2000, 1000, 500, 500)).toEqual({ sx: 500, sy: 0, sw: 1000, sh: 1000 });
  });
  it("縦長の画像は上下を切る", () => {
    expect(coverRect(1000, 2000, 500, 500)).toEqual({ sx: 0, sy: 500, sw: 1000, sh: 1000 });
  });
  it("同じ比率ならそのまま", () => {
    expect(coverRect(1600, 900, 800, 450)).toEqual({ sx: 0, sy: 0, sw: 1600, sh: 900 });
  });
});

describe("gridSpec", () => {
  it("セルは幅をちょうど割り切り、高さを覆う", () => {
    const { cols, rows, cell } = gridSpec(1280, 800, 14);
    expect(cols * cell).toBeCloseTo(1280);
    expect(rows * cell).toBeGreaterThanOrEqual(800);
    expect(cell).toBeGreaterThan(13);
    expect(cell).toBeLessThan(15);
  });
  it("極端に狭くても1列以上", () => {
    expect(gridSpec(4, 4, 14).cols).toBe(1);
  });
});

describe("sweepLevel", () => {
  it("front=0 は全部消灯、front=1 は全部点灯", () => {
    for (const col of [0, 10, 49]) {
      expect(sweepLevel(col, 50, 0)).toBe(0);
      expect(sweepLevel(col, 50, 1)).toBe(1);
    }
  });
  it("左の列ほど先に点灯する", () => {
    expect(sweepLevel(5, 50, 0.5)).toBeGreaterThan(sweepLevel(40, 50, 0.5));
  });
});

describe("pointerBoost / rippleBoost", () => {
  it("中心で 1、半径の外で 0", () => {
    expect(pointerBoost(0, 0, 100)).toBe(1);
    expect(pointerBoost(100, 0, 100)).toBe(0);
    expect(pointerBoost(300, 400, 100)).toBe(0);
  });
  it("リングは時間とともに外へ進み、寿命で消える", () => {
    expect(rippleBoost(100, 0.5, 1, 200, 40)).toBeGreaterThan(0.4);
    expect(rippleBoost(0, 0.5, 1, 200, 40)).toBe(0);
    expect(rippleBoost(100, 1, 1, 200, 40)).toBe(0);
    expect(rippleBoost(100, -0.1, 1, 200, 40)).toBe(0);
  });
});

describe("dotRadius", () => {
  it("消灯でも針先ほどの点は残る", () => {
    expect(dotRadius(14, 1, 0, 0, 0)).toBeCloseTo(14 * 0.07);
  });
  it("明るいほど、点灯するほど、ブーストするほど大きい", () => {
    expect(dotRadius(14, 1, 1, 0, 0)).toBeGreaterThan(dotRadius(14, 0.2, 1, 0, 0));
    expect(dotRadius(14, 0.5, 1, 0, 0)).toBeGreaterThan(dotRadius(14, 0.5, 0.3, 0, 0));
    expect(dotRadius(14, 0.5, 1, 1, 0)).toBeGreaterThan(dotRadius(14, 0.5, 1, 0, 0));
  });
  it("shrink=1 で消える。セルの半分は超えない", () => {
    expect(dotRadius(14, 1, 1, 0, 1)).toBe(0);
    expect(dotRadius(14, 1, 1, 0, 0)).toBeLessThanOrEqual(14 / 2);
  });
});

describe("luma", () => {
  it("白は 1、黒は 0", () => {
    expect(luma(255, 255, 255)).toBeCloseTo(1);
    expect(luma(0, 0, 0)).toBe(0);
  });
});
