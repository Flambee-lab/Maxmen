"use client";

import { useLayoutEffect, useMemo, useState } from "react";

type CoachVeloHole = {
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
};

function maskPropertiesFromHoles(
  size: { w: number; h: number },
  holes: CoachVeloHole[]
): React.CSSProperties {
  const vbW = Math.max(1, size.w);
  const vbH = Math.max(1, size.h);

  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="none"><rect width="${vbW}" height="${vbH}" fill="#ffffff"/>${holes
    .map(
      (hole) =>
        `<rect x="${hole.x.toFixed(2)}" y="${hole.y.toFixed(2)}" width="${hole.w.toFixed(2)}" height="${hole.h.toFixed(2)}" rx="${hole.rx.toFixed(2)}" ry="${hole.rx.toFixed(2)}" fill="#000000"/>`
    )
    .join("")}</svg>`;

  const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(maskSvg)}")`;

  return {
    WebkitMaskImage: maskUrl,
    WebkitMaskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    WebkitMaskPosition: "0 0",
    maskImage: maskUrl,
    maskSize: "100% 100%",
    maskRepeat: "no-repeat",
    maskPosition: "0 0",
  } as React.CSSProperties;
}

export type CoachSpotlightMasks = {
  previewMaskStyle: React.CSSProperties;
  veloMaskStyle: React.CSSProperties;
};

/** Máscaras del velo y del preview con los mismos agujeros (data-coach-overlay-hole). */
export function useCoachSpotlightMask(
  coachRef: React.RefObject<HTMLDivElement | null>,
  stepKey: string | number
): CoachSpotlightMasks {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [holes, setHoles] = useState<CoachVeloHole[]>([]);

  useLayoutEffect(() => {
    const coach = coachRef.current;
    if (!coach) return;

    const measure = () => {
      const coachRect = coach.getBoundingClientRect();
      setSize({ w: coachRect.width, h: coachRect.height });
      const els = coach.querySelectorAll<HTMLElement>("[data-coach-overlay-hole]");
      const next: CoachVeloHole[] = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const br = getComputedStyle(el).borderRadius;
        const parsed = parseFloat(br) || 0;
        const rx = Math.min(parsed, r.width / 2, r.height / 2);
        next.push({
          x: r.left - coachRect.left,
          y: r.top - coachRect.top,
          w: r.width,
          h: r.height,
          rx,
        });
      });
      setHoles(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(coach);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [coachRef, stepKey]);

  return useMemo(() => {
    return {
      previewMaskStyle: maskPropertiesFromHoles(size, holes),
      veloMaskStyle: maskPropertiesFromHoles(size, holes),
    };
  }, [size.w, size.h, holes]);
}

export function CoachVeloOverlay({ maskStyle }: { maskStyle: React.CSSProperties }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        background:
          "linear-gradient(to top, rgba(40, 75, 121, 0.62), rgba(0, 0, 0, 0.80))",
        ...maskStyle,
      }}
    />
  );
}
