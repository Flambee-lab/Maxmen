import type { ContentItem } from "@/types/contentLibrary";
import { getContentRepository } from "./repository";

/** Archivo estático en `public/` (se versiona con Git). */
export const CONTENT_LIBRARY_SEED_PATH = "/content-library-seed.json";

function isValidPayload(v: unknown): v is { version: 1; items: ContentItem[] } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.version === 1 && Array.isArray(o.items);
}

/**
 * Si la biblioteca local está vacía, intenta cargar `public/content-library-seed.json`.
 * Así el contenido commiteado en el repo está disponible al abrir el sitio otra vez.
 */
export async function tryHydrateContentLibraryFromPublicSeed(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const repo = getContentRepository();
  const existing = await repo.getAll();
  if (existing.length > 0) return false;

  try {
    const res = await fetch(CONTENT_LIBRARY_SEED_PATH, { cache: "no-store" });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    if (!isValidPayload(data) || data.items.length === 0) return false;
    await repo.importAll(data.items);
    return true;
  } catch {
    return false;
  }
}
