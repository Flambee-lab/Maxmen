import type { GameLibraryDeck } from "@/types/gameLibraryDeck";
import type { NameChip, PhotoCard } from "@/types/game";
import type {
  ContentItem,
  EventContentItem,
  ObjectContentItem,
  OtherContentItem,
  PersonContentItem,
  PetContentItem,
  PlaceContentItem,
} from "@/types/contentLibrary";

const PLACEHOLDER_IMG = "/assets/card-1.png";

const ROUND_CATEGORY: Record<string, string> = {
  name: "Name",
  relationships: "Relationships",
  birthday: "Birthday",
  occupation: "Occupation",
  lives_in: "Lives in",
  anniversary: "Anniversary",
  spouse_name: "Spouse name",
  children_names: "Children names",
  show_appearances: "Show appearances",
  specific_location: "Location",
  breed_or_type: "Breed / type",
  purpose: "Purpose",
  event_type: "Event type",
  event_for_who: "For who",
  event_for_what: "For what",
  description: "Description",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DISTRACTOR_NAMES = [
  "Riley",
  "Jordan",
  "Sam",
  "Quinn",
  "Morgan",
  "Casey",
];

function pickDistractor(used: Set<string>, pool: string[]): string {
  for (const p of pool) {
    if (!used.has(p)) return p;
  }
  return `Extra ${Math.random().toString(36).slice(2, 6)}`;
}

function formatBirthdayLabel(raw: string): string {
  const s = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + "T12:00:00");
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return s;
}

function getValueForQuestion(
  p: PersonContentItem,
  q: string
): string | null {
  switch (q) {
    case "name":
      return p.name?.trim() || null;
    case "relationships":
      return p.relationship?.trim() || null;
    case "birthday":
      return p.birthday?.trim() ? formatBirthdayLabel(p.birthday) : null;
    case "occupation":
      return p.occupation?.trim() || null;
    case "lives_in":
      return p.lives_in?.trim() || null;
    case "anniversary":
      return p.anniversary?.trim() || null;
    case "spouse_name":
      return p.spouse_name?.trim() || null;
    case "children_names":
      return p.children_names?.trim() || null;
    case "show_appearances":
      return p.show_appearances?.trim() || null;
    default:
      return null;
  }
}

/**
 * Valor por tipo de pregunta para cualquier ítem de la biblioteca (personas, lugares, mascotas, …).
 */
export function getValueForContentItem(item: ContentItem, q: string): string | null {
  if (item.topic === "persons") {
    return getValueForQuestion(item as PersonContentItem, q);
  }
  switch (q) {
    case "name":
      return item.name?.trim() || null;
    case "specific_location":
      return item.topic === "places"
        ? (item as PlaceContentItem).specific_location?.trim() || null
        : null;
    case "breed_or_type":
      return item.topic === "pets"
        ? (item as PetContentItem).breed_or_type?.trim() || null
        : null;
    case "purpose":
      return item.topic === "objects"
        ? (item as ObjectContentItem).purpose?.trim() || null
        : null;
    case "event_type":
      return item.topic === "events"
        ? (item as EventContentItem).event_type?.trim() || null
        : null;
    case "event_for_who":
      return item.topic === "events"
        ? (item as EventContentItem).event_for_who?.trim() || null
        : null;
    case "event_for_what":
      return item.topic === "events"
        ? (item as EventContentItem).event_for_what?.trim() || null
        : null;
    case "description":
      return item.topic === "others"
        ? (item as OtherContentItem).description?.trim() || null
        : null;
    default:
      return null;
  }
}

export function getCategoryLabelForQuestionId(q: string): string {
  return ROUND_CATEGORY[q] ?? q;
}

export function distractorPoolForRound(questionId: string): string[] {
  if (questionId === "name" || questionId === "relationships") {
    return ["Cousin", "Neighbor", "Colleague", "Teammate", "Coach", "Friend"];
  }
  if (questionId === "birthday" || questionId === "anniversary") {
    return ["Jan 1, 1990", "Dec 31, 2000", "Jun 15, 1988", "Mar 3, 1975"];
  }
  if (questionId === "specific_location") {
    return ["Downtown", "North Park", "Central Station", "Riverside", "Old Town"];
  }
  if (questionId === "breed_or_type") {
    return ["Mixed breed", "Persian", "Siamese", "Beagle", "Terrier"];
  }
  if (questionId === "purpose") {
    return ["Storage", "Display", "Daily use", "Travel", "Gift"];
  }
  if (questionId === "event_type" || questionId === "event_for_who" || questionId === "event_for_what") {
    return ["Option A", "Option B", "Option C", "Other", "TBD"];
  }
  if (questionId === "description") {
    return ["Note 1", "Note 2", "Note 3", "Misc", "Extra"];
  }
  return [
    "Unknown A",
    "Unknown B",
    "Unknown C",
    "Placeholder X",
    "Placeholder Y",
  ];
}

/**
 * Personas que tienen todos los campos requeridos por las rondas elegidas.
 */
function filterCandidatesWithAllFields(
  persons: PersonContentItem[],
  questionIds: string[]
): PersonContentItem[] {
  return persons.filter((p) =>
    questionIds.every((q) => {
      const v = getValueForQuestion(p, q);
      return v !== null && v.length > 0;
    })
  );
}

/** Máximo de fotos por ronda (dificultad Easy/Medium/Hard = 3/4/5). */
const ABSOLUTE_MAX_CARDS = 5;
const DEFAULT_MAX_CARDS = 4;

/** Máximo de rondas = lo definido en Specs paso 3 (como mucho 3 question types). */
export const MAX_GAME_ROUNDS = 3;

/**
 * Mazo: una ronda por question type en `selectedQuestionIds` (orden = orden de selección en paso 3).
 * Como mucho {@link MAX_GAME_ROUNDS} rondas; hasta 4 cartas; mínimo 1 persona con todos los campos elegidos.
 */
export function buildPersonGameLibrary(
  persons: PersonContentItem[],
  selectedQuestionIds: string[],
  options?: { maxCards?: number }
): GameLibraryDeck | null {
  const qids = selectedQuestionIds.filter(Boolean).slice(0, MAX_GAME_ROUNDS);
  if (persons.length === 0 || qids.length === 0) return null;

  const candidates = filterCandidatesWithAllFields(persons, qids);
  if (candidates.length === 0) return null;

  const cap = options?.maxCards;
  const maxCards =
    typeof cap === "number" &&
    Number.isFinite(cap) &&
    cap >= 1
      ? Math.min(ABSOLUTE_MAX_CARDS, Math.floor(cap))
      : DEFAULT_MAX_CARDS;

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

  const cardId = (p: PersonContentItem) => `card-${p.id}`;

  const relationshipByCardId: Record<string, string> = {};
  const birthDateByCardId: Record<string, string> = {};
  picked.forEach((p) => {
    const cid = cardId(p);
    if (p.relationship?.trim()) {
      relationshipByCardId[cid] = p.relationship.trim();
    }
    if (p.birthday?.trim()) {
      birthDateByCardId[cid] = formatBirthdayLabel(p.birthday);
    }
  });

  const mappingsPerRound: Record<string, string>[] = [];
  const roundChips: NameChip[][] = [];
  const roundCategoryLabels: string[] = [];

  qids.forEach((qid, roundIndex) => {
    roundCategoryLabels.push(getCategoryLabelForQuestionId(qid));

    const labels = picked.map((p) => getValueForQuestion(p, qid)!.trim());
    const mapping: Record<string, string> = {};
    picked.forEach((p) => {
      const v = getValueForQuestion(p, qid)!.trim();
      mapping[v] = cardId(p);
    });

    const used = new Set(labels);
    const distractor = pickDistractor(used, distractorPoolForRound(qid));

    const chips: NameChip[] = [
      ...shuffle(
        labels.map((label, i) => ({
          id: `chip-r${roundIndex + 1}-${i}`,
          name: label,
          isSelected: false,
          isMatched: false,
          correctCardId: mapping[label]!,
        }))
      ),
      {
        id: `chip-distractor-r${roundIndex + 1}`,
        name: distractor,
        isSelected: false,
        isMatched: false,
        correctCardId: "__distractor__",
        isDistractor: true,
      },
    ];

    roundChips.push(chips);
    mappingsPerRound.push(mapping);
  });

  return {
    cards,
    totalRounds: qids.length,
    roundChips,
    mappingsPerRound,
    mappingNames: mappingsPerRound[0] ?? {},
    relationshipByCardId,
    birthDateByCardId,
    roundCategoryLabels,
    roundQuestionIds: [...qids],
  };
}

function filterContentCandidatesWithAllFields(
  items: ContentItem[],
  questionIds: string[]
): ContentItem[] {
  return items.filter((p) =>
    questionIds.every((q) => {
      const v = getValueForContentItem(p, q);
      return v !== null && v.length > 0;
    })
  );
}

/**
 * Igual que {@link buildPersonGameLibrary} pero para lugares, mascotas, objetos, eventos u otros
 * (cualquier ítem que no sea solo “personas” en el pool).
 */
export function buildContentGameLibrary(
  items: ContentItem[],
  selectedQuestionIds: string[],
  options?: { maxCards?: number }
): GameLibraryDeck | null {
  const qids = selectedQuestionIds.filter(Boolean).slice(0, MAX_GAME_ROUNDS);
  if (items.length === 0 || qids.length === 0) return null;

  const candidates = filterContentCandidatesWithAllFields(items, qids);
  if (candidates.length === 0) return null;

  const cap = options?.maxCards;
  const maxCards =
    typeof cap === "number" &&
    Number.isFinite(cap) &&
    cap >= 1
      ? Math.min(ABSOLUTE_MAX_CARDS, Math.floor(cap))
      : DEFAULT_MAX_CARDS;

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

  const cardIdFn = (p: ContentItem) => `card-${p.id}`;

  const relationshipByCardId: Record<string, string> = {};
  const birthDateByCardId: Record<string, string> = {};
  picked.forEach((p) => {
    const cid = cardIdFn(p);
    if (qids.length >= 2) {
      const v = getValueForContentItem(p, qids[1]);
      if (v) relationshipByCardId[cid] = v;
    }
    if (qids.length >= 3) {
      const v = getValueForContentItem(p, qids[2]);
      if (v) birthDateByCardId[cid] = v;
    }
  });

  const mappingsPerRound: Record<string, string>[] = [];
  const roundChips: NameChip[][] = [];
  const roundCategoryLabels: string[] = [];

  qids.forEach((qid, roundIndex) => {
    roundCategoryLabels.push(getCategoryLabelForQuestionId(qid));

    const labels = picked.map((p) => getValueForContentItem(p, qid)!.trim());
    const mapping: Record<string, string> = {};
    picked.forEach((p) => {
      const v = getValueForContentItem(p, qid)!.trim();
      mapping[v] = cardIdFn(p);
    });

    const used = new Set(labels);
    const distractor = pickDistractor(used, distractorPoolForRound(qid));

    const chips: NameChip[] = [
      ...shuffle(
        labels.map((label, i) => ({
          id: `chip-r${roundIndex + 1}-${i}`,
          name: label,
          isSelected: false,
          isMatched: false,
          correctCardId: mapping[label]!,
        }))
      ),
      {
        id: `chip-distractor-r${roundIndex + 1}`,
        name: distractor,
        isSelected: false,
        isMatched: false,
        correctCardId: "__distractor__",
        isDistractor: true,
      },
    ];

    roundChips.push(chips);
    mappingsPerRound.push(mapping);
  });

  return {
    cards,
    totalRounds: qids.length,
    roundChips,
    mappingsPerRound,
    mappingNames: mappingsPerRound[0] ?? {},
    relationshipByCardId,
    birthDateByCardId,
    roundCategoryLabels,
    roundQuestionIds: [...qids],
  };
}
