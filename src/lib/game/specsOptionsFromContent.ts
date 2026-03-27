import type {
  ContentItem,
  PersonContentItem,
  Topic,
  PersonSubgroup,
} from "@/types/contentLibrary";
import { TOPICS, PERSON_SUBGROUPS } from "@/types/contentLibrary";

/** Etiquetas UI para Specs paso 1 (topic) */
export const TOPIC_LABELS: Record<Topic, string> = {
  persons: "Persons",
  places: "Places",
  objects: "Objects",
  pets: "Pets",
  events: "Events",
  others: "Other",
};

/** Etiquetas UI para Specs paso 2 (subgrupo de personas) */
export const PERSON_SUBGROUP_LABELS: Record<PersonSubgroup, string> = {
  immediate_family: "Immediate family",
  relatives: "Relatives",
  friends: "Friends",
  custom_groups: "Custom groups",
  other_vips: "Other VIPs",
  artists_musicians: "Artists / Musicians",
};

/**
 * Solo topics que tienen al menos un ítem en la biblioteca (orden fijo de {@link TOPICS}).
 */
export function buildTopicOptionsFromContent(
  items: ContentItem[]
): { id: string; label: string }[] {
  const seen = new Set<Topic>();
  for (const i of items) {
    seen.add(i.topic);
  }
  return TOPICS.filter((t) => seen.has(t)).map((t) => ({
    id: t,
    label: TOPIC_LABELS[t],
  }));
}

/**
 * Subgrupos presentes en los datos de personas (orden de {@link PERSON_SUBGROUPS}).
 */
export function buildSubgroupOptionsFromPersons(
  persons: PersonContentItem[]
): { id: PersonSubgroup; label: string }[] {
  const seen = new Set<PersonSubgroup>();
  for (const p of persons) {
    seen.add(p.subgroup);
  }
  return PERSON_SUBGROUPS.filter((sg) => seen.has(sg)).map((id) => ({
    id,
    label: PERSON_SUBGROUP_LABELS[id],
  }));
}

/**
 * Subgrupos que aún no tienen ninguna persona en la biblioteca (para hints en Specs 2).
 */
export function buildSubgroupLabelsNotInLibrary(
  persons: PersonContentItem[]
): { id: PersonSubgroup; label: string }[] {
  const withData = new Set<PersonSubgroup>();
  for (const p of persons) {
    withData.add(p.subgroup);
  }
  return PERSON_SUBGROUPS.filter((sg) => !withData.has(sg)).map((id) => ({
    id,
    label: PERSON_SUBGROUP_LABELS[id],
  }));
}

/**
 * Pool para Specs 3 / mazo: topics elegidos en paso 1; si hay subgrupo (paso 2), filtra personas.
 */
export function filterContentBySpecsSelection(
  items: ContentItem[],
  selectedTopicIds: string[],
  subgroup: PersonSubgroup | null
): ContentItem[] {
  return items.filter((i) => {
    if (!selectedTopicIds.includes(i.topic)) return false;
    if (i.topic === "persons" && subgroup !== null) {
      return (i as PersonContentItem).subgroup === subgroup;
    }
    return true;
  });
}
