"use client";

import { useLayoutEffect, useState } from "react";

import { COACH_PREVIEW_CHIPS } from "@/components/game/coach/CoachGamePreview";
import {
  COACH_CHIP_SPOTLIGHT_HEIGHT_PX,
  COACH_CHIP_SPOTLIGHT_TOP_PX,
  COACH_CONNECT_CHIP_CENTER_OFFSET_FROM_VIEWPORT_CENTER_PX,
  COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX,
  COACH_SPOTLIGHT_FOCUS_PADDING_PX,
  COACH_SPOTLIGHT_RADIUS_PX,
} from "@/components/game/coach/coachLayout";
import { Chip } from "@/components/game/Chip";

const TOM_CHIP = COACH_PREVIEW_CHIPS[1];

/** Misma flecha que Chip / coachLayout (ConnectorArrow sobre la pastilla) */
const CHIP_ARROW_ABOVE_PX = 32;

function fallbackTomBox(focusPad: number, focusPad2: number) {
  if (typeof window === "undefined") {
    return {
      top: COACH_CHIP_SPOTLIGHT_TOP_PX - focusPad,
      left: 0,
      width: COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2,
      height: COACH_CHIP_SPOTLIGHT_HEIGHT_PX + focusPad2,
    };
  }
  const w = window.innerWidth;
  const left =
    w / 2 +
    COACH_CONNECT_CHIP_CENTER_OFFSET_FROM_VIEWPORT_CENTER_PX -
    (COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2) / 2;
  return {
    top: COACH_CHIP_SPOTLIGHT_TOP_PX - focusPad,
    left,
    width: COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2,
    height: COACH_CHIP_SPOTLIGHT_HEIGHT_PX + focusPad2,
  };
}

/**
 * Marco del foco sobre Tom (Connect): posición medida en DOM + Chip en capa 3 para que se vea
 * iluminado (el preview está recortado en ese agujero, igual que la carta central).
 */
export function CoachConnectTomSpotlightFrame({
  coachRef,
  stepKey,
}: {
  coachRef: React.RefObject<HTMLDivElement | null>;
  stepKey: string | number;
}) {
  const focusPad = COACH_SPOTLIGHT_FOCUS_PADDING_PX;
  const focusPad2 = focusPad * 2;
  const [box, setBox] = useState(() => fallbackTomBox(focusPad, focusPad2));

  useLayoutEffect(() => {
    const coach = coachRef.current;
    if (!coach) return;

    const measure = () => {
      const target = coach.querySelector<HTMLElement>("[data-coach-tom-target]");
      if (!target) {
        setBox(fallbackTomBox(focusPad, focusPad2));
        return;
      }
      const coachRect = coach.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      setBox({
        top: r.top - coachRect.top - focusPad - CHIP_ARROW_ABOVE_PX,
        left: r.left - coachRect.left - focusPad,
        width: r.width + focusPad2,
        height: r.height + focusPad2 + CHIP_ARROW_ABOVE_PX,
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
        maxWidth: "92vw",
        height: box.height,
        borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
        zIndex: 3,
      }}
    >
      <div className="coach-spotlight-frame__clip flex items-center justify-center">
        <div className="game-chip-enter" style={{ animationDelay: "0ms" }}>
          <Chip
            label={TOM_CHIP.name}
            nameId={TOM_CHIP.id}
            arrowHeight={32}
            isHovered={false}
            isDragging={false}
            isSelected={false}
            hideRestArrow={false}
            arrowOpacity={1}
            onClick={() => {}}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
