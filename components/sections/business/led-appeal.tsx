import Link from "next/link";
import { ArrowRight, Eye, Film, MapPin, RefreshCw, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { SectionEyebrow } from "@/components/sections/home/section-eyebrow";
import type { Business } from "@/lib/content";

type Pricing = NonNullable<Business["pricing"]>;

const POINTS: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Eye,
    title: "夜でも、遠くからでも目に入る",
    body: "LEDは画面そのものが光ります。看板に照明を当てる必要がなく、夜の国分町でも広告がくっきり浮かび上がります。",
  },
  {
    Icon: Film,
    title: "動画だから、雰囲気まで伝わる",
    body: "料理のシズル感、店内の空気、イベントの熱気。止まった絵では伝えきれないことを、映像でそのまま届けられます。",
  },
  {
    Icon: RefreshCw,
    title: "季節に合わせて、内容を変える",
    body: "放映するのは映像データです。看板の貼り替えと違い、キャンペーンや季節に合わせた内容への変更をご相談いただけます。",
  },
  {
    Icon: MapPin,
    title: "人の流れの中に、毎日いる",
    body: "国分町の主要な通りに設置。チラシのように受け取ってもらう必要はなく、歩く人の視界に自然と入ります。",
  },
];

/**
 * Signage business: why LED. A navy band lit like a dot-matrix display, four
 * reasons as a divided list (not cards), and the real loop numbers from the
 * pricing data. Static, so there is no motion beyond the section reveal.
 */
export function LedAppeal({ pricing }: { pricing: Pricing }) {
  const lowest = Math.min(...pricing.plans.map((p) => p.price));
  const stats = [
    { value: pricing.plans.length, unit: "拠点", label: "国分町エリアに設置" },
    { value: pricing.slots, unit: "枠", label: "ご用意している広告枠" },
    { value: pricing.seconds, unit: "秒", label: "1枠あたりの放映時間" },
    { value: lowest.toLocaleString("ja-JP"), unit: "円〜", label: "1拠点あたり月額・税込" },
  ];

  return (
    <section
      data-testid="led-appeal"
      aria-labelledby="led-heading"
      className="relative isolate overflow-hidden bg-brand-navy py-24 text-surface md:py-36"
    >
      {/* LED panel: a grid of unlit dots that fades out toward the bottom, with a blue glow behind. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-brand-sky)_32%,transparent)_1.5px,transparent_2px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="bg-brand-gradient absolute -right-1/4 -top-1/3 -z-10 aspect-square w-[44rem] max-w-[140%] rounded-full opacity-60 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionEyebrow tone="onDark">WHY LED</SectionEyebrow>
          <h2
            id="led-heading"
            className="mt-5 max-w-3xl text-3xl font-bold leading-[1.4] [word-break:auto-phrase] md:text-5xl md:leading-[1.3]"
          >
            夜の国分町で、広告が自ら光る。
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-[2] text-surface/75 [word-break:auto-phrase] md:text-base md:leading-[2.1]">
            遊栄ビジョンはLEDの大型ビジョンです。人通りの多い通りで、ひと目で届く広告を、映像でお見せできます。
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-12 md:mt-16">
          <dl className="grid grid-cols-2 gap-y-8 border-y border-surface/20 py-8 md:grid-cols-4 md:py-10">
            {stats.map((s) => (
              <div key={s.label} className="md:border-l md:border-surface/20 md:pl-8 md:first:border-l-0 md:first:pl-0">
                <dd className="font-display text-4xl font-bold leading-none md:text-5xl">
                  {s.value}
                  <span className="ml-1 text-base font-bold text-brand-sky md:text-lg">{s.unit}</span>
                </dd>
                <dt className="mt-3 text-xs leading-[1.8] text-surface/70 md:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <ul className="mt-12 grid gap-x-16 md:mt-16 md:grid-cols-2">
          {POINTS.map(({ Icon, title, body }, i) => (
            <Reveal as="li" key={title} delay={(i % 2) * 0.08}>
              <div className="flex gap-5 border-b border-surface/15 py-8 md:gap-6 md:py-10">
                <Icon aria-hidden className="mt-1 size-6 shrink-0 text-brand-sky md:size-7" />
                <div>
                  <h3 className="text-lg font-bold leading-snug [word-break:auto-phrase] md:text-xl">{title}</h3>
                  <p className="mt-3 text-sm leading-[1.95] text-surface/75 [word-break:auto-phrase] md:text-base">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 flex flex-col gap-3 sm:flex-row md:mt-16">
          <Link
            href="/contact?type=signage"
            className="group inline-flex items-center justify-between gap-6 rounded-full bg-surface px-7 py-4 text-sm font-bold text-brand-navy transition-[color,background-color,transform] duration-hover ease-brand-out hover:bg-brand-sky active:scale-[0.98] md:text-base md:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-sky"
          >
            広告掲載を相談する
            <ArrowRight aria-hidden className="size-4 transition-transform duration-hover group-hover:translate-x-1" />
          </Link>
          <a
            href="#pricing"
            className="inline-flex items-center justify-center rounded-full border border-surface/35 px-7 py-4 text-sm font-bold text-surface transition-[border-color,background-color] duration-hover hover:border-surface hover:bg-surface/10 md:text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-sky"
          >
            料金を見る
          </a>
        </Reveal>
      </div>
    </section>
  );
}
