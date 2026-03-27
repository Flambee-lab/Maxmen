"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CONTENT_LIBRARY_UPDATED_EVENT } from "@/lib/contentLibrary/events";
import { getContentRepository } from "@/lib/contentLibrary/repository";
import { TOPIC_LABELS } from "@/lib/contentLibrary/topicLabels";
import type { ContentItem } from "@/types/contentLibrary";

export function ContentList() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getContentRepository().getAll();
    setItems(
      [...list].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener(CONTENT_LIBRARY_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CONTENT_LIBRARY_UPDATED_EVENT, handler);
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este ítem?")) return;
    await getContentRepository().delete(id);
    void load();
  }

  if (loading) {
    return (
      <p className="text-white/70" role="status">
        Cargando…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-white/70">
        Todavía no cargaste contenido. Creá el primer ítem para empezar.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10">
              {item.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoDataUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-xs text-white/40">
                  Sin foto
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{item.name}</p>
              <p className="text-sm text-white/60">
                {TOPIC_LABELS[item.topic]}
              </p>
              <p className="text-xs text-white/40">
                Actualizado{" "}
                {new Date(item.updatedAt).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={`/content/${item.id}/edit`}
              className="rounded-xl border border-white/25 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => void handleDelete(item.id)}
              className="rounded-xl border border-red-400/40 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              Borrar
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
