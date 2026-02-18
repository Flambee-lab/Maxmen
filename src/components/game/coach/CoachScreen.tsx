"use client";

import { Background } from "@/components/game/Background";
import { CoachGamePreview } from "@/components/game/coach/CoachGamePreview";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";

/** Posición del bloque cards+slots (solo esto se muestra; el resto no se renderiza). */
const CARDS_TOP = 156;

interface CoachScreenProps {
  onContinue: () => void;
}

/**
 * Coach: solo cards + header coach + popup Recognize.
 * No se renderizan: título del juego, lámparas, timer, chips, Reveal, pause/sound.
 * Orden: (1) Fondo (2) Overlay 80% (3) Cards+slots (4) Header (5) Popup.
 */
export function CoachScreen({ onContinue }: CoachScreenProps) {
  return (
    <div className="relative w-full min-h-screen">
      {/* 1) Fondo (misma estética que el juego) */}
      <div className="absolute inset-0 pointer-events-none">
        <Background />
      </div>

      {/* 2) Overlay negro 80% — no tapa las cards porque van encima */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "rgba(0, 0, 0, 0.80)",
        }}
      />

      {/* 3) Solo cards + connect slots (encima del overlay) */}
      <div
        className="absolute left-1/2 pointer-events-none"
        style={{
          top: `${CARDS_TOP}px`,
          transform: "translateX(-50%)",
        }}
      >
        <CoachGamePreview />
      </div>

      {/* 4) Coach header */}
      <div
        className="absolute left-0 right-0 top-0 pt-12 text-center pointer-events-none"
        style={{
          fontFamily: "var(--font-bitter), serif",
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: "32px",
            color: "#FFFFFF",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          Remind Game
        </h1>
        <p
          style={{
            fontWeight: 500,
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.85)",
            margin: 0,
          }}
        >
          Instructions
        </p>
      </div>

      {/* 5) Coach popup Recognize (encima de todo) */}
      <div
        className="absolute pointer-events-auto rounded-xl px-6 py-5"
        style={{
          bottom: "40px",
          right: "24px",
          width: "min(340px, 85vw)",
          background: "rgba(30, 44, 81, 0.95)",
          border: "2px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          fontFamily: "var(--font-bitter), serif",
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: "22px",
            color: "#FFFFFF",
            margin: 0,
            marginBottom: "12px",
          }}
        >
          Recognize
        </p>
        <p
          style={{
            fontWeight: 500,
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.9)",
            lineHeight: 1.4,
            margin: 0,
            marginBottom: "16px",
          }}
        >
          Look at each picture to see if you recognize someone.
        </p>
        <p
          style={{
            fontWeight: 600,
            fontSize: "16px",
            color: "rgba(255, 255, 255, 0.75)",
            margin: 0,
            marginBottom: "20px",
          }}
        >
          1 of 1
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onContinue}
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "rgba(255, 255, 255, 0.9)",
              background: "transparent",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              borderRadius: "24px",
              padding: "12px 24px",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
          <GamePrimaryButton
            onClick={onContinue}
            style={{
              width: "auto",
              minWidth: "140px",
              height: "52px",
              fontSize: "18px",
            }}
          >
            Next
          </GamePrimaryButton>
        </div>
      </div>
    </div>
  );
}
