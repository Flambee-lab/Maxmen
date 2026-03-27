import type { GameLibraryDeck } from "@/types/gameLibraryDeck";
import { formatCardLineForQuestion } from "./formatCardLineForQuestion";

/**
 * Líneas completas esperadas en la card al final del juego (todas las rondas acertadas).
 */
export function buildFullCardContentLinesFromDeck(
  deck: GameLibraryDeck,
  cardId: string
): string[] {
  const lines: string[] = [];
  for (let r = 0; r < deck.totalRounds; r++) {
    const mapping = deck.mappingsPerRound[r];
    const qid = deck.roundQuestionIds[r] ?? "name";
    const chipName = Object.keys(mapping).find((k) => mapping[k] === cardId);
    if (chipName) lines.push(formatCardLineForQuestion(qid, chipName));
  }
  return lines;
}
