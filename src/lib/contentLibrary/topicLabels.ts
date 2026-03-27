import type { PersonSubgroup, Topic } from "@/types/contentLibrary";

export const TOPIC_LABELS: Record<Topic, string> = {
  persons: "Persons",
  places: "Places",
  objects: "Objects",
  pets: "Pets",
  events: "Events",
  others: "Other",
};

export const PERSON_SUBGROUP_LABELS: Record<PersonSubgroup, string> = {
  immediate_family: "Immediate family",
  relatives: "Extended family",
  friends: "Friends",
  custom_groups: "Custom groups",
  other_vips: "Other VIPs",
  artists_musicians: "Artists / musicians",
};
