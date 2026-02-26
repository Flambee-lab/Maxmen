"use client";

import { BackgroundHalos } from "./BackgroundHalos";

// Variables configurables
const RING_STROKE = 144; // Grosor del stroke en px
const RING_BLUR = 250; // Blur en px
const RING_OVERSIZE_FACTOR = 1.2; // Factor de oversize (120% del viewport)

export function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fondo sólido */}
      <div className="absolute inset-0 bg-[#284B79]" />

      {/* Halos blancos blur, animación muy suave (detrás del aro) */}
      <BackgroundHalos />

      {/* Aro de luz — gira lentamente para dar sensación de luz en movimiento */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full border bg-ring-spin"
        style={{
          width: `${RING_OVERSIZE_FACTOR * 100}vmax`,
          height: `${RING_OVERSIZE_FACTOR * 100}vmax`,
          borderWidth: `${RING_STROKE}px`,
          borderColor: `rgba(198, 154, 175, 0.80)`,
          filter: `blur(${RING_BLUR}px)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
