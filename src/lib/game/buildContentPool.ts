import type {
  ContentItem,
  PersonContentItem,
  Topic,
  PersonSubgroup,
} from "@/types/contentLibrary";
import { isTopic } from "@/types/contentLibrary";

/**
 * Pool de ítems según topics (paso 1) y subgrupos (paso 2).
 * IDs de subgrupo: `persons:immediate_family`, `places:all`, etc.
 */
export function buildContentPool(
  items: ContentItem[],
  selectedTopicIds: string[],
  selectedSubgroupIds: string[]
): ContentItem[] {
  if (selectedTopicIds.length === 0 || selectedSubgroupIds.length === 0) {
    return [];
  }

  const topics = new Set(selectedTopicIds.filter(isTopic));
  const out = new Set<ContentItem>();

  for (const sid of selectedSubgroupIds) {
    if (sid.startsWith("persons:")) {
      const rest = sid.slice("persons:".length) as PersonSubgroup | "all";
      const persons = items.filter(
        (i): i is PersonContentItem => i.topic === "persons"
      );
      if (!topics.has("persons")) continue;
      if (rest === "all") {
        persons.forEach((p) => out.add(p));
      } else {
        persons
          .filter((p) => p.subgroup === rest)
          .forEach((p) => out.add(p));
      }
      continue;
    }

    if (sid.endsWith(":all")) {
      const topic = sid.slice(0, -":all".length) as Topic;
      if (!topics.has(topic)) continue;
      items.filter((i) => i.topic === topic).forEach((i) => out.add(i));
    }
  }

  return [...out];
}
