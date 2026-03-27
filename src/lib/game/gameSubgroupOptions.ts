import type {
  ContentItem,
  PersonContentItem,
  Topic,
} from "@/types/contentLibrary";
import {
  PERSON_SUBGROUPS,
  type PersonSubgroup,
  isTopic,
} from "@/types/contentLibrary";

/** Etiquetas alineadas al copy del producto (inglés). */
export const PERSON_SUBGROUP_LABELS_EN: Record<PersonSubgroup, string> = {
  immediate_family: "Immediate family",
  relatives: "All relatives",
  friends: "Friends",
  custom_groups: "Custom groups",
  other_vips: "Other VIPs",
  artists_musicians: "Artists / Musicians",
};

const TOPIC_ALL_LABEL: Record<Topic, string> = {
  persons: "All persons",
  places: "All places",
  objects: "All objects",
  pets: "All pets",
  events: "All events",
  others: "All others",
};

/**
 * Paso 2: subgrupos según topics elegidos en paso 1.
 * - persons: un id por subgrupo con datos (`persons:immediate_family`, …).
 * - resto: un id `topic:all` si hay ítems (sin subgrupo en el modelo actual).
 */
export function buildSubgroupOptionsForTopics(
  selectedTopicIds: string[],
  items: ContentItem[]
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  const topics = new Set(selectedTopicIds.filter(isTopic));

  if (topics.has("persons")) {
    const persons = items.filter(
      (i): i is PersonContentItem => i.topic === "persons"
    );
    for (const sg of PERSON_SUBGROUPS) {
      const count = persons.filter((p) => p.subgroup === sg).length;
      if (count > 0) {
        out.push({
          id: `persons:${sg}`,
          label: PERSON_SUBGROUP_LABELS_EN[sg],
        });
      }
    }
  }

  for (const t of topics) {
    if (t === "persons") continue;
    const count = items.filter((i) => i.topic === t).length;
    if (count > 0) {
      out.push({ id: `${t}:all`, label: TOPIC_ALL_LABEL[t] });
    }
  }

  return out;
}
