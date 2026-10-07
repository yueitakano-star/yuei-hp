"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import GlyphPortal from "@/components/effects/glyph-portal";
import { LedAppeal } from "@/components/sections/business/led-appeal";
import type { Business } from "@/lib/content";

type Pricing = NonNullable<Business["pricing"]>;

const FONT = "var(--font-space-grotesk)";
const WEIGHT = 700;
const WORD = "VISION";

/**
 * Signage page: the word VISION with a street photo showing through the
 * letters. Scrolling steps the camera into one letter; the navy LED section
 * (LedAppeal) is what's on the other side. The photo and the navy field sit
 * behind the type, so the zoom ends on the same colour LedAppeal is drawn on.
 *
 * Motion is the portal's own (scroll-driven, painted only while on screen) and
 * is static under reduced motion and until the heading font has loaded.
 */
export function VisionPortal({
  pricing,
  photo,
}: {
  pricing: Pricing;
  photo: string;
}) {
  // GlyphPortal freezes the face it finds at mount. If the heading font isn't
  // ready yet, remount once it is so the letters are measured in the real face.
  const [fontEpoch, setFontEpoch] = useState(0);
  useEffect(() => {
    // The first family is the real face; the rest are fallbacks that may never load.
    const family = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-space-grotesk")
      .split(",")[0]
      ?.trim();
    if (!family) return;
    const spec = `${WEIGHT} 100px ${family}`;
    if (document.fonts.check(spec, WORD)) return;
    let live = true;
    const timeout = window.setTimeout(() => {
      live = false;
    }, 2500);
    document.fonts
      .load(spec, WORD)
      .then(
        () => {
          if (live) setFontEpoch(1);
        },
        () => {},
      )
      .finally(() => window.clearTimeout(timeout));
    return () => {
      live = false;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div data-testid="vision-portal">
      <GlyphPortal
        key={fontEpoch}
        word={WORD}
        fontFamily={FONT}
        fontWeight={WEIGHT}
        scrollLength={1.8}
        enterLabel="LEDの魅力を見る"
        hint="スクロールして、中へ。"
        className="[&_[data-gp-content]]:p-0 [&_[data-gp-touch-picker]]:hidden [&_[data-gp-caption]]:justify-center [&_[data-gp-caption]]:text-sm [&_[data-gp-caption]]:font-bold [&_[data-gp-caption]]:text-brand-navy"
        background={
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ transform: "scale(var(--gp-field-scale,1))" }}
          >
            <Image
              src={photo}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-brand-navy/80" />
            <div className="absolute inset-0 [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-brand-sky)_32%,transparent)_1.5px,transparent_2px)] [background-size:14px_14px]" />
            <div className="bg-brand-gradient absolute -right-1/4 -top-1/3 aspect-square w-[44rem] max-w-[140%] rounded-full opacity-50 blur-3xl" />
          </div>
        }
        front={
          <>
            <p
              className="absolute inset-x-6 text-center font-display text-sm font-bold tracking-[0.6em] text-brand-navy md:text-base"
              style={{
                bottom: "calc(100% - var(--gp-word-top, 35%) + 1.25rem)",
              }}
            >
              YUEI
            </p>
            <p
              className="absolute inset-x-6 text-center text-sm leading-relaxed text-ink-muted [word-break:auto-phrase] md:text-base"
              style={{ top: "calc(var(--gp-word-bottom, 50%) + 1.5rem)" }}
            >
              国分町の街角に光る、LEDの大型ビジョン。
            </p>
          </>
        }
      >
        <LedAppeal pricing={pricing} embedded />
      </GlyphPortal>
    </div>
  );
}
