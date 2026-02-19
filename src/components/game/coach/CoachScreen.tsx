"use client";

import { CoachGamePreview } from "@/components/game/coach/CoachGamePreview";
import { CardStage } from "@/components/game/CardStage";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { mockCards } from "@/mocks/gameMocks";

const COACH_CARDS = mockCards.slice(0, 3);

/** Spotlight: solo cards + connect slots. Preview Coach = 3 cards → ancho 3×208+2×20 = 664. */
const SPOTLIGHT_TOP = 156;
const SPOTLIGHT_WIDTH = 664;
const SPOTLIGHT_HEIGHT = 232;
const SPOTLIGHT_RADIUS = 16;
const SPOTLIGHT_HALF = SPOTLIGHT_WIDTH / 2;

interface CoachScreenProps {
  onContinue: () => void;
}

/**
 * CoachScreen: juego completo detrás de overlay 80%, spotlight revela solo cards+slots.
 * Orden: (1) GamePlay completo (2) Overlay 80% (3) SpotlightWindow (4) Coach header + popup.
 */
export function CoachScreen({ onContinue }: CoachScreenProps) {
  return (
    <div className="coach-screen relative w-full min-h-screen">
      {/* Layer 1: GamePlay completo (bloqueado, sin interacción) - z-index: 1 */}
      <div
        className="pointer-events-none select-none absolute inset-0"
        style={{ zIndex: 1 }}
      >
        <CoachGamePreview skipBackground hideTitle />
      </div>

      {/* Layer 2: Overlay negro 80% — tapa TODO el juego - z-index: 2 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "rgba(0, 0, 0, 0.80)",
          zIndex: 2,
        }}
      />

      {/* Layer 3: Spotlight window — revela SOLO cards+slots encima del overlay - z-index: 3 */}
      <div
        className="absolute overflow-hidden pointer-events-none"
        style={{
          top: `${SPOTLIGHT_TOP}px`,
          left: "50%",
          marginLeft: `-${SPOTLIGHT_HALF}px`,
          width: `${SPOTLIGHT_WIDTH}px`,
          maxWidth: "92vw",
          height: `${SPOTLIGHT_HEIGHT}px`,
          borderRadius: `${SPOTLIGHT_RADIUS}px`,
          zIndex: 3,
        }}
      >
        {/* Solo CardStage dentro del spotlight (no HUD, no chips, no título) */}
        {/* CardStage ya tiene su propio padding px-4, así que no agregamos padding extra */}
        <CardStage
          cards={COACH_CARDS}
          highlightedCardId={null}
          onCardHover={() => {}}
          onCardDrop={() => {}}
        />
      </div>

      {/* Layer 4: Coach header - z-index: 4 */}
      <div
        className="absolute left-0 right-0 top-0 pt-12 text-center pointer-events-none"
        style={{
          fontFamily: "var(--font-bitter), serif",
          zIndex: 4,
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

      {/* Layer 4: Coach popup Recognize (encima de todo) - z-index: 4 */}
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
          zIndex: 4,
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
