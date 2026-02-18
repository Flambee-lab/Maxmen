"use client";

import { CardStage } from "@/components/game/CardStage";
import { mockCards } from "@/mocks/gameMocks";

/** Solo para Coach: renderiza ÚNICAMENTE el grid de cards + connect slots. Sin título, HUD, chips ni Reveal. */
const COACH_CARDS = mockCards.slice(0, 3);

/**
 * Preview mínimo para CoachScreen: solo 3 cards y sus círculos de conexión.
 * No existe en el DOM: título del juego, lámparas/vidas, timer, pause/sound, chips, botón Reveal.
 */
export function CoachGamePreview() {
  return (
    <CardStage
      cards={COACH_CARDS}
      highlightedCardId={null}
      onCardHover={() => {}}
      onCardDrop={() => {}}
    />
  );
}
