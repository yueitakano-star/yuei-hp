"use client";

// Source: https://www.crafterui.com/ (Works Wheel, by Crafter UI)
// Local changes: the wheel is driven by page scroll over a pinned stage instead of capturing the
// wheel / drag (nothing is hijacked, touch scrolls it natively); no frame loop; site tokens;
// next/image; a static grid under reduced motion and until the script runs.

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion } from "motion/react";
import { useLenis } from "lenis/react";
import { useStableScroll } from "@/lib/effects/stable-scroll";
import {
  activeItem,
  cardState,
  place,
  progressForItem,
  turnAt,
  wheelMetrics,
  type WheelMetrics,
} from "@/lib/effects/wheel-geometry";

export type WorksWheelItem = {
  image: string;
  /** Shown beside the front card. Without one only the number is shown. */
  title?: string;
};

type Props = {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. */
  label: string;
  /** Accessible name of an image without a title; its number is appended (e.g. "焼肉Enのお料理" → "… 3"). */
  imageAlt: string;
  className?: string;
};

/** Scroll distance per item, in small-viewport heights. */
const SVH_PER_ITEM = 0.7;
const pad = (n: number) => String(n).padStart(2, "0");
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A work index built as a wheel you scroll through. At rest the pictures sit in
 * a ring around the label; the first stretch of scroll opens the ring into a
 * vertical drum, the picture at the front lies flat and full size, and the ones
 * above and below rotate away. Keep scrolling and the drum carries the next
 * picture round. The stage is pinned (sticky) inside a tall section, so the
 * page scrolls as usual and the wheel follows it.
 *
 * Positions are written straight to the DOM from the scroll value; nothing
 * runs between scroll events. Under reduced motion, and until the script has
 * run, the pictures are a plain grid instead.
 */
export function WorksWheel({ items, label, imageAlt, className }: Props) {
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const count = items.length;
  const groupRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const indexRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const metrics = useRef<WheelMetrics | null>(null);
  const progress = useStableScroll(sectionRef, ["start start", "end end"]);

  const render = useCallback(() => {
    const m = metrics.current;
    const wheel = wheelRef.current;
    if (!m || !wheel) return;
    const turn = turnAt(progress.get(), count);
    const open = Math.min(1, Math.max(0, turn));
    wheel.style.transform = `translateZ(${-open * m.drumR}px) scale(${lerp(m.ringFit, 1, open)})`;
    for (let i = 0; i < count; i++) {
      const card = cardRefs.current[i];
      if (!card) continue;
      const s = cardState(i, turn, count);
      card.style.transform = place(s.ringDeg, s.drumDeg, m.ringR, m.drumR, m.bow, s.m);
      card.style.opacity = s.hidden ? "0" : "1";
      card.style.zIndex = String(s.z);
      const face = card.firstElementChild as HTMLElement | null;
      if (face) face.style.transform = `scale(${lerp(m.ringScale, 1, s.m)})`;
    }
    const active = activeItem(turn, count);
    if (labelRef.current) labelRef.current.style.opacity = String(1 - open);
    if (captionRef.current) captionRef.current.style.opacity = String(open);
    if (numberRef.current) numberRef.current.textContent = `${pad(active + 1)} / ${pad(count)}`;
    if (nameRef.current) nameRef.current.textContent = items[active]?.title ?? "";
    indexRefs.current.forEach((button, i) => {
      if (!button) return;
      const on = open > 0.5 && i === active;
      button.dataset.active = String(on);
      if (on) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }, [count, items, progress]);

  useMotionValueEvent(progress, "change", render);

  // Measure the stage, size the cards, and switch the grid for the wheel.
  useLayoutEffect(() => {
    const group = groupRef.current;
    const stage = stageRef.current;
    if (!group || !stage || reduced || count === 0) return;
    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const m = wheelMetrics(w, h, count);
      metrics.current = m;
      stage.style.perspective = `${m.depth}px`;
      for (const card of cardRefs.current) {
        if (!card) continue;
        card.style.width = `${m.cardW}px`;
        card.style.height = `${m.cardH}px`;
        card.style.marginLeft = `${-m.cardW / 2}px`;
        card.style.marginTop = `${-m.cardH / 2}px`;
      }
      if (labelRef.current) labelRef.current.style.fontSize = `${m.title * 1.6}px`;
      if (captionRef.current) captionRef.current.style.fontSize = `${m.title}px`;
      group.dataset.wheel = "on";
      render();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => {
      ro.disconnect();
      delete group.dataset.wheel;
      metrics.current = null;
    };
  }, [count, reduced, render]);

  // Keep the first paint on the ring even if the scroll value has not changed yet.
  useEffect(() => {
    if (!reduced) render();
  }, [reduced, render]);

  const goTo = (index: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const svh = stageRef.current?.clientHeight ?? window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const y = top + progressForItem(index, count) * (section.offsetHeight - svh);
    if (lenis) lenis.scrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div ref={groupRef} className={`group ${className ?? ""}`}>
      {/* Static grid: reduced motion, and before the wheel has taken over. */}
      <div className="group-data-[wheel=on]:hidden bg-ink py-16 text-surface md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-display text-xs tracking-[0.3em] text-brand-sky">{label}</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {items.map((item, i) => (
              <li key={item.image}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink">
                  <Image
                    src={item.image}
                    alt={item.title ?? `${imageAlt} ${i + 1}`}
                    fill
                    sizes="(min-width: 80rem) 24rem, (min-width: 48rem) 30vw, 45vw"
                    className="object-cover"
                  />
                </div>
                {item.title && <p className="mt-3 text-sm font-bold">{item.title}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section
        ref={sectionRef}
        aria-label={label}
        data-testid="works-wheel"
        // Before the wheel takes over it is only collapsed (not display:none) so the stage can be measured.
        className="invisible relative max-h-0 overflow-hidden bg-ink text-surface group-data-[wheel=on]:visible group-data-[wheel=on]:max-h-none group-data-[wheel=on]:overflow-visible"
        style={{ height: `${100 + count * SVH_PER_ITEM * 100}svh` }}
      >
        <div ref={stageRef} className="sticky top-0 h-svh select-none overflow-hidden">
          <div ref={wheelRef} className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]">
            {items.map((item, i) => (
              <div
                key={item.image}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="absolute [backface-visibility:hidden]"
              >
                <span className="relative block size-full overflow-hidden rounded-lg bg-ink shadow-[0_18px_40px_-18px] shadow-ink">
                  <Image
                    src={item.image}
                    alt={item.title ?? `${imageAlt} ${i + 1}`}
                    fill
                    draggable={false}
                    sizes="(min-width: 48rem) 34vw, 72vw"
                    className="object-cover"
                  />
                </span>
              </div>
            ))}
          </div>

          {/* The ring's label and the front card's caption trade places as the ring opens. */}
          <div
            ref={labelRef}
            className="pointer-events-none absolute inset-0 grid place-items-center font-bold tracking-tight"
          >
            {label}
          </div>
          <div
            ref={captionRef}
            className="pointer-events-none absolute inset-x-0 bottom-[7%] flex flex-col gap-1 px-6 text-center font-bold tracking-tight opacity-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-[6%] md:-translate-y-1/2 md:px-0 md:text-left"
          >
            <span ref={numberRef} className="font-display text-[0.7em] tracking-[0.2em] text-brand-sky" />
            <span ref={nameRef} />
          </div>

          <ol className="absolute top-1/2 right-[2.5%] hidden -translate-y-1/2 text-right text-xs leading-[2] text-surface/60 md:block">
            {items.map((item, i) => (
              <li key={item.image}>
                <button
                  type="button"
                  ref={(node) => {
                    indexRefs.current[i] = node;
                  }}
                  onClick={() => goTo(i)}
                  data-active="false"
                  className="cursor-pointer font-display tracking-[0.15em] transition-colors duration-hover hover:text-surface focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-sky data-[active=true]:font-bold data-[active=true]:text-surface"
                >
                  {pad(i + 1)}
                  {item.title ? ` ${item.title}` : ""}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default WorksWheel;
