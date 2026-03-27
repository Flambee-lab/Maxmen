import type { NameChip, PhotoCard } from "@/types/game";

/**
 * Mazo y mappings derivados de la biblioteca de contenido (local / futuro API).
 * Soporta N rondas según los question types elegidos.
 */
export interface GameLibraryDeck {
  cards: PhotoCard[];
  /**
   * Si está definido, cada ronda usa su propio conjunto de fotos (topics distintos por ronda).
   * `cards` debe coincidir con `cardsPerRound[0]` para compatibilidad.
   */
  cardsPerRound?: PhotoCard[][];
  totalRounds: number;
  /** Índice 0 = ronda 1 */
  roundChips: NameChip[][];
  /** Por ronda: etiqueta del chip → id de card correcto */
  mappingsPerRound: Record<string, string>[];
  /**
   * Compat: mapping de la primera ronda (útil para time-up / transiciones).
   * Suele coincidir con mappingsPerRound[0].
   */
  mappingNames: Record<string, string>;
  relationshipByCardId: Record<string, string>;
  birthDateByCardId: Record<string, string>;
  /** Título de categoría por ronda (intro / transición) */
  roundCategoryLabels: string[];
  /** Mismo orden que en Specs paso 3: Round 1 = [0], etc. */
  roundQuestionIds: string[];
}
