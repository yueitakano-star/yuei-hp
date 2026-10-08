import Image from "next/image";
import type { ReactNode } from "react";
import { Reveal } from "@/components/effects/reveal";
import { SectionEyebrow } from "@/components/sections/home/section-eyebrow";
import { cn } from "@/lib/utils";

/**
 * Digital business: what the "広告物" actually looks like. Three pieces set in
 * real type over generated, text-free artwork: a flyer (A4), a web banner and
 * a square social banner. The shops and the copy are FICTIONAL and the section
 * says so. Type is sized in container units (cqw), so each piece keeps its
 * proportions at any width.
 */

const PIECE = "relative isolate overflow-hidden [container-type:inline-size] shadow-xl shadow-brand-navy/10";

function Caption({ children }: { children: ReactNode }) {
  return <figcaption className="mt-3 text-xs leading-[1.8] text-ink-muted md:text-sm">{children}</figcaption>;
}

function SampleMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute z-10 rounded-sm bg-ink/70 px-[1.6cqw] py-[0.6cqw] font-display text-[2.2cqw] tracking-[0.2em] text-surface",
        className,
      )}
    >
      SAMPLE
    </span>
  );
}

function Flyer() {
  return (
    <figure>
      <div className={cn(PIECE, "aspect-[1/1.414] rounded-sm bg-surface")}>
        <Image
          src="/images/generated/sample-flyer-art.webp"
          alt="喫茶店のチラシのサンプル。ラテとクロワッサンの写真の上に、キャッチコピーと店名を載せています。"
          fill
          sizes="(min-width: 64rem) 30rem, calc(100vw - 2.5rem)"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-surface/85 via-transparent to-surface/90" />
        <SampleMark className="top-[3cqw] right-[3cqw]" />
        <div aria-hidden className="absolute inset-x-0 top-0 px-[8cqw] pt-[9cqw] text-ink">
          <p className="font-display text-[3.2cqw] tracking-[0.5em]">NEW OPEN</p>
          <p className="mt-[3cqw] font-heading text-[8.6cqw] font-bold leading-[1.3]">
            朝のひとときを、
            <br />
            ていねいに。
          </p>
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-[4cqw] px-[8cqw] pb-[8cqw] text-ink">
          <div>
            <p className="font-heading text-[4cqw] font-bold leading-[1.7]">
              ブレンドコーヒーと
              <br />
              焼きたてのクロワッサン
            </p>
          </div>
          <p className="shrink-0 border-l-2 border-ink pl-[3cqw] font-heading text-[7cqw] font-bold leading-[1.15]">
            喫茶
            <br />
            つむぎ
          </p>
        </div>
      </div>
      <Caption>チラシ（A4）</Caption>
    </figure>
  );
}

function WideBanner() {
  return (
    <figure>
      <div className={cn(PIECE, "aspect-[1200/628] rounded-lg bg-brand-sky")}>
        <Image
          src="/images/generated/sample-banner-wide-art.webp"
          alt="かき氷店のWebバナーのサンプル。フルーツのかき氷の写真の左に、フェアの見出しを載せています。"
          fill
          sizes="(min-width: 64rem) 44rem, calc(100vw - 2.5rem)"
          className="object-cover"
        />
        <SampleMark className="top-[2.2cqw] left-[2.2cqw]" />
        <div aria-hidden className="absolute inset-y-0 left-0 flex w-[56%] flex-col justify-center pl-[6cqw] text-surface">
          <p className="font-display text-[2.2cqw] tracking-[0.4em]">SUMMER FAIR</p>
          <p className="mt-[1.6cqw] font-heading text-[6.4cqw] font-bold leading-[1.2] [text-shadow:0_0.3cqw_1.2cqw_rgb(0_15_80/0.35)]">
            夏の氷菓
            <br />
            フェア開催
          </p>
          <p className="mt-[2cqw] font-heading text-[2.6cqw] font-bold">かき氷 雪うさぎ</p>
          <span className="mt-[2.6cqw] inline-flex w-fit rounded-full bg-surface px-[3cqw] py-[1cqw] font-heading text-[2.2cqw] font-bold text-brand-navy">
            詳しくはこちら
          </span>
        </div>
      </div>
      <Caption>Webバナー（1200×628）</Caption>
    </figure>
  );
}

function SquareBanner() {
  return (
    <figure>
      <div className={cn(PIECE, "aspect-square rounded-lg bg-surface-muted")}>
        <Image
          src="/images/generated/sample-square-art.webp"
          alt="ヨガスタジオのSNSバナーのサンプル。ヨガマットと観葉植物の写真の上に、体験レッスンの案内を載せています。"
          fill
          sizes="(min-width: 64rem) 22rem, calc(100vw - 2.5rem)"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-b from-surface/80 via-surface/10 to-transparent" />
        <SampleMark className="right-[4cqw] bottom-[4cqw]" />
        <div aria-hidden className="absolute inset-x-0 top-0 px-[8cqw] pt-[9cqw] text-ink">
          <p className="font-display text-[3cqw] tracking-[0.4em]">YOGA STUDIO</p>
          <p className="mt-[3cqw] font-heading text-[9.5cqw] font-bold leading-[1.25]">
            はじめての
            <br />
            ヨガ体験
          </p>
          <p className="mt-[3cqw] font-heading text-[3.8cqw] font-bold">レッスン受付中｜そよ風ヨガ</p>
        </div>
      </div>
      <Caption>SNSバナー（1080×1080）</Caption>
    </figure>
  );
}

export function WorksSamples() {
  return (
    <section data-testid="works-samples" aria-labelledby="works-heading" className="bg-surface py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionEyebrow>SAMPLES</SectionEyebrow>
          <h2 id="works-heading" className="mt-4 text-3xl font-bold text-ink md:text-5xl">
            制作イメージ
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-[2] text-ink-muted [word-break:auto-phrase] md:text-base">
            チラシ、Webバナー、SNS用の画像まで、媒体に合わせて制作します。下のサンプルは、架空のお店を想定してつくったものです。実在のお店や実績ではありません。
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 md:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <Reveal>
            <Flyer />
          </Reveal>
          <div className="flex flex-col gap-10 lg:gap-14">
            <Reveal delay={0.08}>
              <WideBanner />
            </Reveal>
            <div className="grid items-end gap-10 sm:grid-cols-2 lg:gap-14">
              <Reveal delay={0.12}>
                <SquareBanner />
              </Reveal>
              <Reveal delay={0.16}>
                <p className="text-sm leading-[2] text-ink-muted [word-break:auto-phrase] md:text-base">
                  掲載する場所や見られ方に合わせて、サイズも言葉の量も変えます。紙でも、画面でも、SNSでも、同じお店の顔として揃うようにデザインします。
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
