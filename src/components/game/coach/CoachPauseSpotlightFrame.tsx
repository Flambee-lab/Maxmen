"use client";

import { useLayoutEffect, useState } from "react";

import {
  COACH_PAUSE_BUTTON_SIZE_PX,
  COACH_SPOTLIGHT_FOCUS_PADDING_PX,
} from "@/components/game/coach/coachLayout";
import { PauseButton } from "@/components/game/PauseButton";

const EXTRA_INSET_PX = 8;

function fallbackPauseBox(focusPad: number, focusPad2: number) {
  const extra = EXTRA_INSET_PX;
  const pad = focusPad + extra;
  const pad2 = focusPad2 + extra * 2;
  const outer = COACH_PAUSE_BUTTON_SIZE_PX + pad2;
  const w = typeof window !== "undefined" ? window.innerWidth : 1200;
  return {
    top: 16 - pad,
    left: w - 24 - COACH_PAUSE_BUTTON_SIZE_PX - pad,
    width: outer,
    height: outer,
  };
}

/**
 * Paso Pause: foco sobre el botón pausa del TopHUD (medición DOM + PauseButton en capa 3).
 */
export function CoachPauseSpotlightFrame({
  coachRef,
  stepKey,
}: {
  coachRef: React.RefObject<HTMLDivElement | null>;
  stepKey: string | number;
}) {
  const focusPad = COACH_SPOTLIGHT_FOCUS_PADDING_PX;
  const focusPad2 = focusPad * 2;
  const [box, setBox] = useState(() => fallbackPauseBox(focusPad, focusPad2));

  useLayoutEffect(() => {
    const coach = coachRef.current;
    if (!coach) return;

    const measure = () => {
      const target = coach.querySelector<HTMLElement>("[data-coach-pause-target]");
      if (!target) {
        setBox(fallbackPauseBox(focusPad, focusPad2));
        return;
      }
      const coachRect = coach.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      setBox({
        top: r.top - coachRect.top - focusPad - EXTRA_INSET_PX,
        left: r.left - coachRect.left - focusPad - EXTRA_INSET_PX,
        width: r.width + focusPad2 + EXTRA_INSET_PX * 2,
        height: r.height + focusPad2 + EXTRA_INSET_PX * 2,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(coach);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [coachRef, stepKey, focusPad, focusPad2]);

  return (
    <div
      className="coach-spotlight-frame absolute pointer-events-none"
      data-coach-overlay-hole
      style={{
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height,
        borderRadius: "36px",
        zIndex: 3,
      }}
    >
      <div className="coach-spotlight-frame__clip flex items-center justify-center">
        <PauseButton onClick={() => {}} />
      </div>
    </div>
  );
}
