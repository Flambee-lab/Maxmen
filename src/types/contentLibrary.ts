/**
 * Biblioteca de contenido del usuario (fotos, metadatos por topic).
 * Independiente de los question types del juego (name, relationship, birthday, etc.).
 */

export const TOPICS = [
  "persons",
  "places",
  "objects",
  "pets",
  "events",
  "others",
] as const;

export type Topic = (typeof TOPICS)[number];

export const PERSON_SUBGROUPS = [
  "immediate_family",
  "relatives",
  "friends",
  "custom_groups",
  "other_vips",
  "artists_musicians",
] as const;

export type PersonSubgroup = (typeof PERSON_SUBGROUPS)[number];

/** Campos comunes a todos los ítems */
export interface ContentItemBase {
  id: string;
  topic: Topic;
  /** Nombre o etiqueta visible */
  name: string;
  /** Imagen: data URL (local) o URL absoluta; en backend futuro será URL de archivo */
  photoDataUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PersonContentFields {
  subgroup: PersonSubgroup;
  relationship?: string;
  birthday?: string;
  occupation?: string;
  lives_in?: string;
  anniversary?: string;
  spouse_name?: string;
  children_names?: string;
  show_appearances?: string;
}

export interface PlaceContentFields {
  specific_location?: string;
}

export interface ObjectContentFields {
  purpose?: string;
}

export interface PetContentFields {
  breed_or_type?: string;
}

export interface EventContentFields {
  event_type?: string;
  event_for_who?: string;
  event_for_what?: string;
}

export interface OtherContentFields {
  description?: string;
}

export type PersonContentItem = ContentItemBase & {
  topic: "persons";
} & PersonContentFields;

export type PlaceContentItem = ContentItemBase & {
  topic: "places";
} & PlaceContentFields;

export type ObjectContentItem = ContentItemBase & {
  topic: "objects";
} & ObjectContentFields;

export type PetContentItem = ContentItemBase & {
  topic: "pets";
} & PetContentFields;

export type EventContentItem = ContentItemBase & {
  topic: "events";
} & EventContentFields;

export type OtherContentItem = ContentItemBase & {
  topic: "others";
} & OtherContentFields;

export type ContentItem =
  | PersonContentItem
  | PlaceContentItem
  | ObjectContentItem
  | PetContentItem
  | EventContentItem
  | OtherContentItem;

/** Payload para crear / actualizar (sin timestamps ni id en create) */
export type ContentItemDraft = Omit<
  ContentItem,
  "id" | "createdAt" | "updatedAt"
>;

export function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}
