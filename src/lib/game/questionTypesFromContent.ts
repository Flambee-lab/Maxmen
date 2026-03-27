import type {
  ContentItem,
  PersonContentItem,
  PlaceContentItem,
  PetContentItem,
  ObjectContentItem,
  EventContentItem,
  OtherContentItem,
  Topic,
} from "@/types/contentLibrary";
import { isTopic } from "@/types/contentLibrary";
import { TOPIC_LABELS } from "@/lib/game/specsOptionsFromContent";

/** IDs estables para Specs 3 y el builder del mazo. */
export type GameQuestionTypeId = string;

/**
 * Tipos de pregunta disponibles según datos reales del pool (≥1 ítem con dato).
 */
export function buildQuestionTypeOptionsForPool(
  pool: ContentItem[]
): { id: GameQuestionTypeId; label: string }[] {
  if (pool.length === 0) return [];

  const persons = pool.filter(
    (i): i is PersonContentItem => i.topic === "persons"
  );
  const personOpts =
    persons.length > 0 ? buildPersonQuestionOptions(persons) : [];
  const nonPersonOpts = buildNonPersonQuestionOptionsFromPool(pool);

  const seen = new Set<GameQuestionTypeId>();
  const out: { id: GameQuestionTypeId; label: string }[] = [];
  for (const o of [...personOpts, ...nonPersonOpts]) {
    if (!seen.has(o.id)) {
      seen.add(o.id);
      out.push(o);
    }
  }
  return out;
}

function buildNonPersonQuestionOptionsFromPool(
  pool: ContentItem[]
): { id: GameQuestionTypeId; label: string }[] {
  const opts: { id: GameQuestionTypeId; label: string }[] = [];
  const hasName = pool.some((i) => i.name?.trim());
  if (hasName) opts.push({ id: "name", label: "Name" });

  const places = pool.filter((i): i is PlaceContentItem => i.topic === "places");
  if (places.some((p) => p.specific_location?.trim())) {
    opts.push({ id: "specific_location", label: "Location" });
  }

  const objects = pool.filter(
    (i): i is ObjectContentItem => i.topic === "objects"
  );
  if (objects.some((o) => o.purpose?.trim())) {
    opts.push({ id: "purpose", label: "Purpose" });
  }

  const pets = pool.filter((i): i is PetContentItem => i.topic === "pets");
  if (pets.some((p) => p.breed_or_type?.trim())) {
    opts.push({ id: "breed_or_type", label: "Breed / type" });
  }

  const events = pool.filter((i): i is EventContentItem => i.topic === "events");
  if (events.some((e) => e.event_type?.trim())) {
    opts.push({ id: "event_type", label: "Event type" });
  }
  if (events.some((e) => e.event_for_who?.trim())) {
    opts.push({ id: "event_for_who", label: "For who" });
  }
  if (events.some((e) => e.event_for_what?.trim())) {
    opts.push({ id: "event_for_what", label: "For what" });
  }

  const others = pool.filter((i): i is OtherContentItem => i.topic === "others");
  if (others.some((o) => o.description?.trim())) {
    opts.push({ id: "description", label: "Description" });
  }

  return opts;
}

export function buildPersonQuestionOptions(
  persons: PersonContentItem[]
): { id: GameQuestionTypeId; label: string }[] {
  const has = (check: (p: PersonContentItem) => boolean) =>
    persons.some(check);

  const opts: { id: GameQuestionTypeId; label: string }[] = [];

  if (has((p) => !!p.name?.trim())) opts.push({ id: "name", label: "Name" });
  if (has((p) => !!p.relationship?.trim())) {
    opts.push({ id: "relationships", label: "Relationships" });
  }
  if (has((p) => !!p.birthday?.trim())) {
    opts.push({ id: "birthday", label: "Birthday" });
  }
  if (has((p) => !!p.occupation?.trim())) {
    opts.push({ id: "occupation", label: "Occupation" });
  }
  if (has((p) => !!p.lives_in?.trim())) {
    opts.push({ id: "lives_in", label: "Lives in" });
  }
  if (has((p) => !!p.anniversary?.trim())) {
    opts.push({ id: "anniversary", label: "Anniversary" });
  }
  if (has((p) => !!p.spouse_name?.trim())) {
    opts.push({ id: "spouse_name", label: "Spouse name" });
  }
  if (has((p) => !!p.children_names?.trim())) {
    opts.push({ id: "children_names", label: "Children names" });
  }
  if (has((p) => !!p.show_appearances?.trim())) {
    opts.push({ id: "show_appearances", label: "Show appearances" });
  }

  return opts;
}

const COMPOSITE_SEP = "::";

/**
 * Opciones para el paso 3: cada chip sigue siendo `topic::questionId`.
 * Con más de un topic en Step 1, el label incluye prefijo ("Persons — Name");
 * con un solo topic, solo el tipo de pregunta ("Name").
 */
export function buildMixedRoundQuestionOptions(
  pool: ContentItem[],
  selectedTopicIds: string[]
): { id: string; label: string }[] {
  const topics = selectedTopicIds.filter((t): t is Topic => isTopic(t));
  if (topics.length === 0 || pool.length === 0) return [];

  const showTopicPrefix = topics.length > 1;
  const out: { id: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const topic of topics) {
    const topicPool = pool.filter((i) => i.topic === topic);
    if (topicPool.length === 0) continue;

    const opts: { id: GameQuestionTypeId; label: string }[] =
      topic === "persons"
        ? buildPersonQuestionOptions(
            topicPool.filter((i): i is PersonContentItem => i.topic === "persons")
          )
        : buildNonPersonQuestionOptionsFromPool(topicPool);

    for (const o of opts) {
      const compositeId = `${topic}${COMPOSITE_SEP}${o.id}`;
      if (seen.has(compositeId)) continue;
      seen.add(compositeId);
      out.push({
        id: compositeId,
        label: showTopicPrefix
          ? `${TOPIC_LABELS[topic]} — ${o.label}`
          : o.label,
      });
    }
  }

  return out;
}
