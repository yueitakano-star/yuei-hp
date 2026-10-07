import type { ReactNode } from "react";
import { LedDotField } from "@/components/effects/led-dot-field";
import { Marquee } from "@/components/effects/marquee";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/page/breadcrumbs";
import { SectionEyebrow } from "@/components/sections/home/section-eyebrow";
import type { Business } from "@/lib/content";

type Pricing = NonNullable<Business["pricing"]>;

type Props = {
  eyebrow: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  photo: string;
  pricing: Pricing;
  breadcrumbs?: BreadcrumbItem[];
};

/**
 * Header of the 遊栄ビジョン page: the street photo drawn as an LED panel
 * (LedDotField), the title lit over it, and a ticker of the real loop numbers
 * along the bottom. The h1 is plain server-rendered text (LCP candidate).
 * Full screen at 100svh, so the iOS toolbar never changes its height.
 */
export function SignageHero({ eyebrow, title, lead, photo, pricing, breadcrumbs }: Props) {
  const lowest = Math.min(...pricing.plans.map((p) => p.price));
  const items = [
    "国分町の夜に、光る広告。",
    `${pricing.plans.length}拠点`,
    `${pricing.slots}枠`,
    `${pricing.seconds}秒`,
    `月額 ${lowest.toLocaleString("ja-JP")}円〜`,
  ];

  return (
    <header
      data-testid="page-header"
      data-header-tone="dark"
      className="relative isolate flex h-svh min-h-[34rem] flex-col overflow-hidden bg-brand-navy text-surface"
    >
      <LedDotField src={photo} className="absolute inset-0 -z-20" />
      {/* Keeps the type readable over the brightest part of the photo. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-brand-navy via-brand-navy/55 to-brand-navy/20 md:bg-linear-to-tr md:from-brand-navy md:via-brand-navy/40 md:to-transparent"
      />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-5 pt-24 pb-10 md:px-8 md:pt-32 md:pb-14">
        {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} tone="onDark" />}
        <div>
          <SectionEyebrow tone="onDark">{eyebrow}</SectionEyebrow>
          <h1 className="mt-5 min-w-0 break-keep text-[clamp(2.75rem,15vw,4.5rem)] font-bold leading-[1.1] md:mt-6 md:text-[min(8rem,calc((100vw-4rem)/7))] md:leading-[1.05]">
            {title}
          </h1>
          {lead && (
            <p className="mt-6 max-w-xl text-sm leading-[2] text-surface/80 [word-break:auto-phrase] md:mt-8 md:text-lg">
              {lead}
            </p>
          )}
        </div>
      </div>

      {/* LED ticker: decorative; the same numbers are in the sections below. */}
      <div aria-hidden className="border-t border-surface/20 bg-brand-navy/70 py-3 backdrop-blur-sm md:py-4">
        <Marquee baseVelocity={3} repeat={4} scrollBoost={2}>
          {items.map((text) => (
            <span
              key={text}
              className="mr-10 shrink-0 font-display text-xl font-bold tracking-[0.12em] text-brand-sky [mask-image:radial-gradient(circle,black_1.1px,transparent_1.6px)] [mask-size:3.5px_3.5px] md:mr-16 md:text-3xl"
            >
              {text}
            </span>
          ))}
        </Marquee>
      </div>
    </header>
  );
}
