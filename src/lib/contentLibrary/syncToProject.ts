import { getContentRepository } from "./repository";

/**
 * Escribe `public/content-library-seed.json` vía API (solo en desarrollo local por defecto).
 */
export async function syncContentLibraryToProjectFile(): Promise<{
  ok: boolean;
  message?: string;
}> {
  const items = await getContentRepository().getAll();
  try {
    const res = await fetch("/api/content-library/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: 1, items }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, message: data.error ?? `Error ${res.status}` };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "No se pudo conectar con el servidor local." };
  }
}
