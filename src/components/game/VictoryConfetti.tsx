"use client";

import type { CSSProperties } from "react";

/**
 * Confeti tipo rectángulos y tiras (sin círculos), blanco + azul UI.
 * `full` = paso celebración (densidad moderada); `half` = resultados (~75% peso visual vs full).
 */
const FULL_COUNT = 44;
const HALF_COUNT = 24;

type PieceKind = "rect-w" | "rect-b" | "strip-w" | "strip-b";

function pieceKindForIndex(i: number): PieceKind {
  const k = i % 4;
  if (k === 0) return "rect-w";
  if (k === 1) return "strip-b";
  if (k === 2) return "rect-b";
  return "strip-w";
}

export function VictoryConfetti({
  intensity,
}: {
  intensity: "full" | "half";
}) {
  const count = intensity === "full" ? FULL_COUNT : HALF_COUNT;
  return (
    <div
      className={`victory-confetti-root victory-confetti-root--${intensity}`}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = ((i * 41.7) % 100) + (i % 5) * 0.35;
        const delay = ((i * 0.19) % 4.2).toFixed(2);
        const duration = 6.2 + (i % 9) * 0.35;
        const drift = -28 + ((i * 17) % 56);
        const rot = ((i * 73) % 280) - 140;
        const style = {
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
          "--drift": `${drift}px`,
          "--spin": `${rot}deg`,
        } as CSSProperties;
        return (
          <span
            key={i}
            className={`victory-confetti-piece victory-confetti-piece--${pieceKindForIndex(i)}`}
            style={style}
          />
        );
      })}
    </div>
  );
}
