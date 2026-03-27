import type { ContentItem, Topic } from "@/types/contentLibrary";
import { isTopic } from "@/types/contentLibrary";
import type { GameLibraryDeck } from "@/types/gameLibraryDeck";
import type { NameChip, PhotoCard } from "@/types/game";
import {
  distractorPoolForRound,
  getCategoryLabelForQuestionId,
  getValueForContentItem,
  MAX_GAME_ROUNDS,
} from "./buildPersonGameLibrary";

const PLACEHOLDER_IMG = "/assets/card-1.png";
const COMPOSITE_SEP = "::";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractor(used: Set<string>, pool: string[]): string {
  for (const p of pool) {
    if (!used.has(p)) return p;
  }
  return `Extra ${Math.random().toString(36).slice(2, 6)}`;
}

export type RoundSpec = { topic: Topic; questionId: string };

/**
 * IDs del paso 3: `topic::questionId` (ej. `pets::breed_or_type`).
 */
export function parseCompositeRoundSpecIds(ids: string[]): RoundSpec[] {
  return ids.map((id) => {
    const i = id.indexOf(COMPOSITE_SEP);
    if (i === -1) {
      throw new Error(`Invalid round spec id (expected topic::questionId): ${id}`);
    }
    const topic = id.slice(0, i);
    const questionId = id.slice(i + COMPOSITE_SEP.length);
    if (!isTopic(topic)) {
      throw new Error(`Invalid topic in round spec: ${topic}`);
    }
    return { topic, questionId };
  });
}

/**
 * Rondas con conjuntos de cartas distintos por ronda (topics mixtos: persons / places / pets…).
 */
export function buildMixedTopicGameLibrary(
  pool: ContentItem[],
  roundSpecs: RoundSpec[],
  options?: { maxCards?: number }
): GameLibraryDeck | null {
  const specs = roundSpecs.slice(0, MAX_GAME_ROUNDS).filter((s) => s.topic && s.questionId);
  if (specs.length === 0) return null;

  const cap = options?.maxCards;
  const maxCards =
    typeof cap === "number" && Number.isFinite(cap) && cap >= 1
      ? Math.min(5, Math.floor(cap))
      : 4;

  const cardsPerRound: PhotoCard[][] = [];
  const roundChips: NameChip[][] = [];
  const mappingsPerRound: Record<string, string>[] = [];
  const roundCategoryLabels: string[] = [];
  const roundQuestionIds: string[] = [];

  for (let r = 0; r < specs.length; r++) {
    const { topic, questionId } = specs[r];
    const topicPool = pool.filter((i) => i.topic === topic);
    const candidates = topicPool.filter((item) => {
      const v = getValueForContentItem(item, questionId);
      return v !== null && v.trim().length > 0;
    });
    if (candidates.length === 0) return null;

    const sorted = [...candidates].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
    );
    const picked = sorted.slice(0, Math.min(maxCards, sorted.length));

    const cards: PhotoCard[] = picked.map((p) => ({
      id: `card-${p.id}`,
      name: (p.name || "").trim(),
      imageUrl: p.photoDataUrl?.trim() || PLACEHOLDER_IMG,
      isHighlighted: false,
      isMatched: false,
    }));

    const cardIdOf = (p: ContentItem) => `card-${p.id}`;

    const mapping: Record<string, string> = {};
    picked.forEach((p) => {
      const v = getValueForContentItem(p, questionId)!.trim();
      mapping[v] = cardIdOf(p);
    });

    const labels = picked.map((p) => getValueForContentItem(p, questionId)!.trim());
    const used = new Set(labels);
    const distractor = pickDistractor(used, distractorPoolForRound(questionId));

    const chips: NameChip[] = [
      ...shuffle(
        labels.map((label, idx) => ({
          id: `chip-r${r + 1}-${idx}`,
          name: label,
          isSelected: false,
          isMatched: false,
          correctCardId: mapping[label]!,
        }))
      ),
      {
        id: `chip-distractor-r${r + 1}`,
        name: distractor,
        isSelected: false,
        isMatched: false,
        correctCardId: "__distractor__",
        isDistractor: true,
      },
    ];

    cardsPerRound.push(cards);
    roundChips.push(chips);
    mappingsPerRound.push(mapping);
    roundCategoryLabels.push(getCategoryLabelForQuestionId(questionId));
    roundQuestionIds.push(questionId);
  }

  const firstCards = cardsPerRound[0] ?? [];

  return {
    cards: firstCards,
    cardsPerRound,
    totalRounds: specs.length,
    roundChips,
    mappingsPerRound,
    mappingNames: mappingsPerRound[0] ?? {},
    relationshipByCardId: {},
    birthDateByCardId: {},
    roundCategoryLabels,
    roundQuestionIds,
  };
}
