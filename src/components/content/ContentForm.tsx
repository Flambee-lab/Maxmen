"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { getContentRepository } from "@/lib/contentLibrary/repository";
import { newContentId } from "@/lib/contentLibrary/ids";
import { PERSON_SUBGROUP_LABELS, TOPIC_LABELS } from "@/lib/contentLibrary/topicLabels";
import type {
  ContentItem,
  PersonSubgroup,
  Topic,
} from "@/types/contentLibrary";
import { PERSON_SUBGROUPS } from "@/types/contentLibrary";

const inputClass =
  "mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#a3bff9] focus:ring-1 focus:ring-[#a3bff9]";

const labelClass = "block text-sm font-medium text-white/90";

function nowIso() {
  return new Date().toISOString();
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

async function readPhotoFile(file: File | null): Promise<string | null> {
  if (!file) return null;
  if (file.size > 2.5 * 1024 * 1024) {
    alert("La imagen es muy grande para guardarla localmente. Probá con una más chica (≤ 2,5 MB).");
    return null;
  }
  return fileToDataUrl(file);
}

export function ContentForm({
  topic,
  mode,
  initialItem,
}: {
  topic: Topic;
  mode: "create" | "edit";
  initialItem?: ContentItem | null;
}) {
  const router = useRouter();
  const repo = useMemo(() => getContentRepository(), []);

  const [name, setName] = useState(initialItem?.name ?? "");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(
    initialItem?.photoDataUrl ?? null
  );
  const [photoHint, setPhotoHint] = useState(
    initialItem?.photoDataUrl ? "Hay una foto guardada. Elegí otra para reemplazarla." : ""
  );

  const [subgroup, setSubgroup] = useState<PersonSubgroup>(
    initialItem?.topic === "persons" ? initialItem.subgroup : "immediate_family"
  );
  const [relationship, setRelationship] = useState(
    initialItem?.topic === "persons" ? initialItem.relationship ?? "" : ""
  );
  const [birthday, setBirthday] = useState(
    initialItem?.topic === "persons" ? initialItem.birthday ?? "" : ""
  );
  const [occupation, setOccupation] = useState(
    initialItem?.topic === "persons" ? initialItem.occupation ?? "" : ""
  );
  const [livesIn, setLivesIn] = useState(
    initialItem?.topic === "persons" ? initialItem.lives_in ?? "" : ""
  );
  const [anniversary, setAnniversary] = useState(
    initialItem?.topic === "persons" ? initialItem.anniversary ?? "" : ""
  );
  const [spouseName, setSpouseName] = useState(
    initialItem?.topic === "persons" ? initialItem.spouse_name ?? "" : ""
  );
  const [childrenNames, setChildrenNames] = useState(
    initialItem?.topic === "persons" ? initialItem.children_names ?? "" : ""
  );
  const [showAppearances, setShowAppearances] = useState(
    initialItem?.topic === "persons" ? initialItem.show_appearances ?? "" : ""
  );

  const [specificLocation, setSpecificLocation] = useState(
    initialItem?.topic === "places" ? initialItem.specific_location ?? "" : ""
  );
  const [purpose, setPurpose] = useState(
    initialItem?.topic === "objects" ? initialItem.purpose ?? "" : ""
  );
  const [breedOrType, setBreedOrType] = useState(
    initialItem?.topic === "pets" ? initialItem.breed_or_type ?? "" : ""
  );
  const [eventType, setEventType] = useState(
    initialItem?.topic === "events" ? initialItem.event_type ?? "" : ""
  );
  const [eventForWho, setEventForWho] = useState(
    initialItem?.topic === "events" ? initialItem.event_for_who ?? "" : ""
  );
  const [eventForWhat, setEventForWhat] = useState(
    initialItem?.topic === "events" ? initialItem.event_for_what ?? "" : ""
  );
  const [description, setDescription] = useState(
    initialItem?.topic === "others" ? initialItem.description ?? "" : ""
  );

  const [saving, setSaving] = useState(false);

  const onPhotoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;
      const data = await readPhotoFile(file);
      if (data) {
        setPhotoDataUrl(data);
        setPhotoHint("Foto lista para guardar.");
      }
    },
    []
  );

  const buildItem = useCallback((): ContentItem | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const base = {
      name: trimmed,
      photoDataUrl,
      updatedAt: nowIso(),
    };

    if (mode === "create") {
      const id = newContentId();
      const createdAt = nowIso();
      switch (topic) {
        case "persons":
          return {
            id,
            topic: "persons",
            ...base,
            createdAt,
            subgroup,
            relationship: relationship.trim() || undefined,
            birthday: birthday.trim() || undefined,
            occupation: occupation.trim() || undefined,
            lives_in: livesIn.trim() || undefined,
            anniversary: anniversary.trim() || undefined,
            spouse_name: spouseName.trim() || undefined,
            children_names: childrenNames.trim() || undefined,
            show_appearances: showAppearances.trim() || undefined,
          } as ContentItem;
        case "places":
          return {
            id,
            topic: "places",
            ...base,
            createdAt,
            specific_location: specificLocation.trim() || undefined,
          } as ContentItem;
        case "objects":
          return {
            id,
            topic: "objects",
            ...base,
            createdAt,
            purpose: purpose.trim() || undefined,
          } as ContentItem;
        case "pets":
          return {
            id,
            topic: "pets",
            ...base,
            createdAt,
            breed_or_type: breedOrType.trim() || undefined,
          } as ContentItem;
        case "events":
          return {
            id,
            topic: "events",
            ...base,
            createdAt,
            event_type: eventType.trim() || undefined,
            event_for_who: eventForWho.trim() || undefined,
            event_for_what: eventForWhat.trim() || undefined,
          } as ContentItem;
        case "others":
          return {
            id,
            topic: "others",
            ...base,
            createdAt,
            description: description.trim() || undefined,
          } as ContentItem;
      }
    }

    if (mode === "edit" && initialItem) {
      const id = initialItem.id;
      const createdAt = initialItem.createdAt;
      switch (topic) {
        case "persons":
          return {
            id,
            topic: "persons",
            ...base,
            createdAt,
            subgroup,
            relationship: relationship.trim() || undefined,
            birthday: birthday.trim() || undefined,
            occupation: occupation.trim() || undefined,
            lives_in: livesIn.trim() || undefined,
            anniversary: anniversary.trim() || undefined,
            spouse_name: spouseName.trim() || undefined,
            children_names: childrenNames.trim() || undefined,
            show_appearances: showAppearances.trim() || undefined,
          } as ContentItem;
        case "places":
          return {
            id,
            topic: "places",
            ...base,
            createdAt,
            specific_location: specificLocation.trim() || undefined,
          } as ContentItem;
        case "objects":
          return {
            id,
            topic: "objects",
            ...base,
            createdAt,
            purpose: purpose.trim() || undefined,
          } as ContentItem;
        case "pets":
          return {
            id,
            topic: "pets",
            ...base,
            createdAt,
            breed_or_type: breedOrType.trim() || undefined,
          } as ContentItem;
        case "events":
          return {
            id,
            topic: "events",
            ...base,
            createdAt,
            event_type: eventType.trim() || undefined,
            event_for_who: eventForWho.trim() || undefined,
            event_for_what: eventForWhat.trim() || undefined,
          } as ContentItem;
        case "others":
          return {
            id,
            topic: "others",
            ...base,
            createdAt,
            description: description.trim() || undefined,
          } as ContentItem;
      }
    }

    return null;
  }, [
    mode,
    initialItem,
    topic,
    name,
    photoDataUrl,
    subgroup,
    relationship,
    birthday,
    occupation,
    livesIn,
    anniversary,
    spouseName,
    childrenNames,
    showAppearances,
    specificLocation,
    purpose,
    breedOrType,
    eventType,
    eventForWho,
    eventForWhat,
    description,
  ]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const item = buildItem();
    if (!item) {
      alert("El nombre es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        await repo.create(item);
      } else {
        await repo.update(item.id, item);
      }
      router.push("/content");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar. Probá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <p className="text-sm text-white/70">
        Topic: <strong className="text-white">{TOPIC_LABELS[topic]}</strong>
      </p>

      <div>
        <label className={labelClass} htmlFor="photo">
          Foto
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          className="mt-2 block w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-white/15 file:px-4 file:py-2 file:text-white hover:file:bg-white/25"
          onChange={onPhotoChange}
        />
        {photoHint && <p className="mt-2 text-xs text-white/50">{photoHint}</p>}
        {photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoDataUrl}
            alt=""
            className="mt-4 max-h-48 max-w-full rounded-xl border border-white/20 object-contain"
          />
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="name">
          Nombre / etiqueta <span className="text-red-300">*</span>
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Ej. Mamá, Casa de la playa…"
        />
      </div>

      {topic === "persons" && (
        <>
          <div>
            <label className={labelClass} htmlFor="subgroup">
              Subgrupo
            </label>
            <select
              id="subgroup"
              value={subgroup}
              onChange={(e) => setSubgroup(e.target.value as PersonSubgroup)}
              className={inputClass}
            >
              {PERSON_SUBGROUPS.map((sg) => (
                <option key={sg} value={sg} className="bg-[color:var(--bg-play-blue)]">
                  {PERSON_SUBGROUP_LABELS[sg]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="relationship">
              Relación
            </label>
            <input
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="birthday">
              Cumpleaños
            </label>
            <input
              id="birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="occupation">
              Ocupación
            </label>
            <input
              id="occupation"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="lives_in">
              Vive en
            </label>
            <input
              id="lives_in"
              value={livesIn}
              onChange={(e) => setLivesIn(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="anniversary">
              Aniversario
            </label>
            <input
              id="anniversary"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="spouse_name">
              Nombre del cónyuge
            </label>
            <input
              id="spouse_name"
              value={spouseName}
              onChange={(e) => setSpouseName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="children_names">
              Nombres de hijos/as
            </label>
            <input
              id="children_names"
              value={childrenNames}
              onChange={(e) => setChildrenNames(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="show_appearances">
              Apariciones / shows
            </label>
            <textarea
              id="show_appearances"
              value={showAppearances}
              onChange={(e) => setShowAppearances(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </div>
        </>
      )}

      {topic === "places" && (
        <div>
          <label className={labelClass} htmlFor="specific_location">
            Ubicación específica
          </label>
          <input
            id="specific_location"
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {topic === "objects" && (
        <div>
          <label className={labelClass} htmlFor="purpose">
            Propósito / uso
          </label>
          <input
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {topic === "pets" && (
        <div>
          <label className={labelClass} htmlFor="breed_or_type">
            Raza o tipo
          </label>
          <input
            id="breed_or_type"
            value={breedOrType}
            onChange={(e) => setBreedOrType(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      {topic === "events" && (
        <>
          <div>
            <label className={labelClass} htmlFor="event_type">
              Tipo de evento
            </label>
            <input
              id="event_type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="event_for_who">
              Evento para quién
            </label>
            <input
              id="event_for_who"
              value={eventForWho}
              onChange={(e) => setEventForWho(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="event_for_what">
              Evento para qué
            </label>
            <input
              id="event_for_what"
              value={eventForWhat}
              onChange={(e) => setEventForWhat(e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {topic === "others" && (
        <div>
          <label className={labelClass} htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[#5a7dab] px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-[#6b8fc0] disabled:opacity-50"
        >
          {saving ? "Guardando…" : mode === "create" ? "Guardar" : "Actualizar"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/content")}
          className="rounded-2xl border border-white/25 px-6 py-3 font-medium text-white/90 transition hover:bg-white/10"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
