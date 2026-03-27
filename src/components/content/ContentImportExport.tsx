"use client";

import { useCallback, useRef, useState } from "react";
import { getContentRepository } from "@/lib/contentLibrary/repository";
import { dispatchContentLibraryUpdated } from "@/lib/contentLibrary/events";
import type { ContentItem } from "@/types/contentLibrary";

function isValidImportPayload(v: unknown): v is { version: 1; items: ContentItem[] } {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.version === 1 && Array.isArray(o.items);
}

export function ContentImportExport({ onChanged }: { onChanged?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setMessage(null);
    const items = await getContentRepository().getAll();
    const payload = { version: 1 as const, items };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-library-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage(
      "Descarga lista. Si ya usás guardado automático en dev, esto es solo una copia extra."
    );
  }, []);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(null);
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const parsed: unknown = JSON.parse(text);
        if (!isValidImportPayload(parsed)) {
          setMessage("El archivo no tiene el formato esperado (version: 1, items: []).");
          return;
        }
        await getContentRepository().importAll(parsed.items);
        dispatchContentLibraryUpdated();
        onChanged?.();
        setMessage(`Importados ${parsed.items.length} ítem(s).`);
      } catch {
        setMessage("No se pudo leer el JSON.");
      }
    },
    [onChanged]
  );

  return (
    <div className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-5">
      <h2 className="mb-2 text-base font-semibold text-white/95">
        GitHub y copia en el proyecto
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-white/70">
        Con <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/90">npm run dev</code>{" "}
        en tu máquina, cada vez que guardás cambios en la biblioteca se actualiza solo el
        archivo{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/90">
          public/content-library-seed.json
        </code>
        . Ahí vas a ver los mismos datos en el explorador de archivos del proyecto: hacés{" "}
        <strong className="font-semibold text-white/85">commit y push</strong> como con
        cualquier otro archivo y queda en GitHub. En el sitio publicado (Vercel, etc.) el
        navegador no puede escribir en el servidor; ahí el flujo manual de JSON sigue
        siendo útil si lo necesitás.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleExport()}
          className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Descargar JSON (copia extra)
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          Importar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {message ? (
        <p className="mt-3 text-sm text-white/80" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
