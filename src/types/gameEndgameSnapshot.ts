import type { NameChip, PhotoCard } from "@/types/game";

/**
 * Estado capturado al terminar la partida para la pantalla de resultados
 * (cartas + chips revelados, reloj congelado, etc.).
 */
export type GameEndgameSnapshot = {
  /** Victoria completa vs. tiempo agotado en la última ronda */
  outcome: "victory" | "timeUp";
  remainingSeconds: number;
  lives: number;
  cards: PhotoCard[];
  /** Etiqueta de chip mostrada por card (respuesta revelada) */
  resolvedByCard: Record<string, string>;
  relationshipByCard: Record<string, string>;
  birthDateByCard: Record<string, string>;
  /** Líneas apiladas por card (nombre → relación → fecha según rondas jugadas) */
  cardContentLinesByCard: Record<string, string[]>;
  /** Chips de la última ronda (para la fila inferior; puede incluir distractores) */
  chips: NameChip[];
  finalRound: 1 | 2 | 3;
  maxRounds: number;
};
