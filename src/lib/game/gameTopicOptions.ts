import type { ContentItem, Topic } from "@/types/contentLibrary";
import { TOPICS } from "@/types/contentLibrary";

const TOPIC_LABEL_EN: Record<Topic, string> = {
  persons: "Persons",
  places: "Places",
  objects: "Objects",
  pets: "Pets",
  events: "Events",
  others: "Others",
};

/** Paso 1: solo topics principales que tengan al menos un ítem en la biblioteca. */
export function buildTopicOptionsFromContent(
  items: ContentItem[]
): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const t of TOPICS) {
    if (items.some((i) => i.topic === t)) {
      out.push({ id: t, label: TOPIC_LABEL_EN[t] });
    }
  }
  return out;
}
