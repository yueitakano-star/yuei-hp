"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cubicBezier, useReducedMotion } from "motion/react";
import { ease, duration } from "@/lib/motion";
import { coverRect, dotRadius, gridSpec, luma, pointerBoost, rippleBoost, sweepLevel } from "@/lib/effects/led-grid";

type Props = { src: string; className?: string };

const out = cubicBezier(...ease.out);

/**
 * A photo drawn as an LED panel: round dots whose size follows the picture's
 * brightness. On load the light sweeps across once, holds for a beat, then the
 * dots close up and the sharp photo takes over, all on a timer, so it plays
 * out in full whether or not the visitor scrolls. Afterwards the dots come back
 * only where the pointer is, and a tap sends a ring outwards (the touch
 * counterpart of hover).
 *
 * Nothing runs continuously: frames are drawn for that one timeline, for a
 * ripple, and when the pointer moves. Under reduced motion the sharp photo is
 * shown and no canvas is drawn. Fills its positioned parent.
 */
export function LedDotField({ src, className }: Props) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const photo = photoRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !photo || !ctx) return;

    if (reduced) {
      photo.style.opacity = "1";
      canvas.style.opacity = "0";
      root.dataset.ledMode = "static";
      return;
    }
    canvas.style.opacity = "1";
    photo.style.opacity = "0";

    const sky = getComputedStyle(document.documentElement).getPropertyValue("--color-brand-sky").trim() || "white";
    const life = duration.slow;
    // Timeline from the first frame: sweep, hold, resolve into the photo.
    const sweepEnd = duration.slow;
    const resolveStart = duration.slow + duration.base;
    const resolveEnd = resolveStart + duration.slow;
    let raf = 0;
    let disposed = false;
    let grid = gridSpec(1, 1, 14);
    let colors: Uint8ClampedArray | null = null;
    let width = 0;
    let height = 0;
    let startedAt: number | null = null;
    let sweep = 0;
    let pointer: { x: number; y: number } | null = null;
    let ripples: { x: number; y: number; at: number }[] = [];

    const sample = () => {
      if (!width || !photo.naturalWidth) return;
      grid = gridSpec(width, height, width >= 768 ? 14 : 11);
      const tiny = document.createElement("canvas");
      tiny.width = grid.cols;
      tiny.height = grid.rows;
      const tctx = tiny.getContext("2d", { willReadFrequently: true });
      if (!tctx) return;
      const { sx, sy, sw, sh } = coverRect(photo.naturalWidth, photo.naturalHeight, grid.cols, grid.rows);
      tctx.imageSmoothingQuality = "high";
      tctx.drawImage(photo, sx, sy, sw, sh, 0, 0, grid.cols, grid.rows);
      colors = tctx.getImageData(0, 0, grid.cols, grid.rows).data;
    };

    const draw = (now: number) => {
      raf = 0;
      if (disposed || !colors) return;
      if (startedAt === null) startedAt = now;
      const t = (now - startedAt) / 1000;
      sweep = out(Math.min(1, t / sweepEnd));
      const mix = out(Math.min(1, Math.max(0, (t - resolveStart) / (resolveEnd - resolveStart))));
      photo.style.opacity = String(mix);
      if (mix >= 1) root.dataset.ledResolved = "true";
      ripples = ripples.filter((r) => (now - r.at) / 1000 < life);

      ctx.clearRect(0, 0, width, height);
      // Once resolved, dots exist only under the pointer or a ripple.
      if (mix >= 1 && !pointer && ripples.length === 0) return;
      const { cols, rows, cell } = grid;
      const radius = cell * 9;
      for (let r = 0; r < rows; r++) {
        const y = (r + 0.5) * cell;
        for (let c = 0; c < cols; c++) {
          const i = (r * cols + c) * 4;
          const x = (c + 0.5) * cell;
          let boost = pointer ? pointerBoost(x - pointer.x, y - pointer.y, radius) : 0;
          for (const rp of ripples) {
            boost = Math.max(boost, rippleBoost(Math.hypot(x - rp.x, y - rp.y), (now - rp.at) / 1000, life, cell * 40, cell * 3));
          }
          const lit = sweepLevel(c, cols, sweep);
          const rad = dotRadius(cell, luma(colors[i], colors[i + 1], colors[i + 2]), lit, boost, mix * (1 - Math.min(1, boost * 1.6)));
          if (rad < 0.3) continue;
          if (lit < 0.02) {
            ctx.globalAlpha = 0.28;
            ctx.fillStyle = sky;
          } else {
            const k = Math.min(1.6, 0.75 + 0.85 * boost);
            ctx.globalAlpha = 0.4 + 0.6 * lit;
            ctx.fillStyle = `rgb(${Math.min(255, colors[i] * k)} ${Math.min(255, colors[i + 1] * k)} ${Math.min(255, colors[i + 2] * k)})`;
          }
          ctx.beginPath();
          ctx.arc(x, y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      // The sweep and ripples are finite; keep drawing only while one is still moving.
      if (t < resolveEnd || ripples.length > 0) schedule();
    };

    const schedule = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const rect = root.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
      schedule();
    };

    const local = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      return x >= 0 && y >= 0 && x <= rect.width && y <= rect.height ? { x, y } : null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = local(e);
      schedule();
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest("a, button")) return;
      const at = local(e);
      if (!at) return;
      ripples.push({ ...at, at: performance.now() });
      schedule();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(root);
    const onLoad = () => {
      sample();
      schedule();
      root.dataset.ledMode = "dots";
    };
    // If the photo never loads, leave the (empty) navy field rather than a dead canvas.
    const onError = () => { photo.style.opacity = "1"; };
    photo.addEventListener("error", onError, { once: true });
    if (photo.complete && photo.naturalWidth) onLoad();
    else photo.addEventListener("load", onLoad, { once: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      photo.removeEventListener("load", onLoad);
      photo.removeEventListener("error", onError);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [reduced]);

  return (
    <div ref={rootRef} aria-hidden className={className} data-testid="led-dot-field">
      <Image
        ref={photoRef}
        src={src}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover opacity-0"
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
