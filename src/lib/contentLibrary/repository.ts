import type { ContentItem } from "@/types/contentLibrary";
import { dispatchContentLibraryUpdated } from "./events";

/**
 * Contrato de persistencia: hoy localStorage; mañana API REST/GraphQL.
 */
export interface ContentLibraryRepository {
  getAll(): Promise<ContentItem[]>;
  getById(id: string): Promise<ContentItem | null>;
  create(item: ContentItem): Promise<ContentItem>;
  update(id: string, item: ContentItem): Promise<ContentItem>;
  delete(id: string): Promise<void>;
  /** Reemplaza toda la biblioteca (importar JSON / semilla desde repo) */
  importAll(items: ContentItem[]): Promise<void>;
}

const STORAGE_KEY = "maxmem_content_library_v1";
const SCHEMA_VERSION = 1 as const;

interface PersistedShape {
  version: typeof SCHEMA_VERSION;
  items: ContentItem[];
}

function loadRaw(): PersistedShape {
  if (typeof window === "undefined") {
    return { version: SCHEMA_VERSION, items: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: SCHEMA_VERSION, items: [] };
    const parsed = JSON.parse(raw) as PersistedShape;
    if (parsed?.version !== SCHEMA_VERSION || !Array.isArray(parsed.items)) {
      return { version: SCHEMA_VERSION, items: [] };
    }
    return parsed;
  } catch {
    return { version: SCHEMA_VERSION, items: [] };
  }
}

function saveRaw(data: PersistedShape): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    dispatchContentLibraryUpdated();
  } catch (e) {
    console.error("[contentLibrary] save failed", e);
    throw e;
  }
}

export const localStorageContentRepository: ContentLibraryRepository = {
  async getAll() {
    return loadRaw().items;
  },

  async getById(id: string) {
    return loadRaw().items.find((i) => i.id === id) ?? null;
  },

  async create(item: ContentItem) {
    const data = loadRaw();
    const next = [...data.items, item];
    saveRaw({ version: SCHEMA_VERSION, items: next });
    return item;
  },

  async update(id: string, item: ContentItem) {
    const data = loadRaw();
    const idx = data.items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Item not found: ${id}`);
    const next = [...data.items];
    next[idx] = item;
    saveRaw({ version: SCHEMA_VERSION, items: next });
    return item;
  },

  async delete(id: string) {
    const data = loadRaw();
    saveRaw({
      version: SCHEMA_VERSION,
      items: data.items.filter((i) => i.id !== id),
    });
  },

  async importAll(items: ContentItem[]) {
    saveRaw({ version: SCHEMA_VERSION, items });
  },
};

/** Repositorio por defecto (inyectable en tests / futuro provider) */
export function getContentRepository(): ContentLibraryRepository {
  return localStorageContentRepository;
}
