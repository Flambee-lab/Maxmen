import type { PersonSubgroup, Topic } from "@/types/contentLibrary";

export const TOPIC_LABELS: Record<Topic, string> = {
  persons: "Personas",
  places: "Lugares",
  objects: "Objetos",
  pets: "Mascotas",
  events: "Eventos",
  others: "Otros",
};

export const PERSON_SUBGROUP_LABELS: Record<PersonSubgroup, string> = {
  immediate_family: "Familia directa",
  relatives: "Familia extendida",
  friends: "Amistades",
  custom_groups: "Grupos personalizados",
  other_vips: "Otros VIPs",
  artists_musicians: "Artistas / músicos",
};
