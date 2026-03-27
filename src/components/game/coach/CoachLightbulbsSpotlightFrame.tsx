"use client";

import { useLayoutEffect, useState } from "react";

import {
  COACH_LIVES_ROW_HEIGHT_PX,
  COACH_LIVES_ROW_WIDTH_PX,
  COACH_SPOTLIGHT_FOCUS_PADDING_PX,
  COACH_SPOTLIGHT_RADIUS_PX,
} from "@/components/game/coach/coachLayout";
import { Lives } from "@/components/game/Lives";

/** Aire extra alrededor de la fila de lámparas (no pegado a los bordes del HUD) */
const EXTRA_INSET_PX = 8;

function fallbackLivesBox(focusPad: number, focusPad2: number) {
  const pad = focusPad + EXTRA_INSET_PX;
  const pad2 = focusPad2 + EXTRA_INSET_PX * 2;
  return {
    top: 16 - pad,
    left: 24 - pad,
    width: COACH_LIVES_ROW_WIDTH_PX + pad2,
    height: COACH_LIVES_ROW_HEIGHT_PX + pad2,
  };
}

/**
 * Paso Lightbulbs: foco sobre la fila de lámparas del TopHUD (medición DOM + Lives en capa 3 iluminados).
 */
export function CoachLightbulbsSpotlightFrame({
  coachRef,
  stepKey,
}: {
  coachRef: React.RefObject<HTMLDivElement | null>;
  stepKey: string | number;
}) {
  const focusPad = COACH_SPOTLIGHT_FOCUS_PADDING_PX;
  const focusPad2 = focusPad * 2;
  const [box, setBox] = useState(() => fallbackLivesBox(focusPad, focusPad2));

  useLayoutEffect(() => {
    const coach = coachRef.current;
    if (!coach) return;

    const measure = () => {
      const target = coach.querySelector<HTMLElement>("[data-coach-lives-target]");
      if (!target) {
        setBox(fallbackLivesBox(focusPad, focusPad2));
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
        maxWidth: "min(92vw, 100%)",
        height: box.height,
        borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
        zIndex: 3,
      }}
    >
      <div className="coach-spotlight-frame__clip flex items-center justify-center">
        <Lives lives={5} maxLives={5} />
      </div>
    </div>
  );
}
