import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TitleLines } from "@/components/page/title-lines";

describe("TitleLines", () => {
  it("各部分を inline-block にする", () => {
    expect(renderToStaticMarkup(<TitleLines parts={["ダイニングバー", "暖家"]} />)).toBe(
      '<span class="inline-block">ダイニングバー</span><span class="inline-block">暖家</span>',
    );
  });

  it("末尾のスペースは部分の外に出して、部分どうしの間隔として残す", () => {
    expect(renderToStaticMarkup(<TitleLines parts={["オ酒ト定食ノ店 ", "暖家"]} />)).toBe(
      '<span class="inline-block">オ酒ト定食ノ店</span> <span class="inline-block">暖家</span>',
    );
  });
});
