"use client";

import { useEffect, useRef } from "react";
import { CONTENT_LIBRARY_UPDATED_EVENT } from "@/lib/contentLibrary/events";
import { syncContentLibraryToProjectFile } from "@/lib/contentLibrary/syncToProject";

const DEBOUNCE_MS = 1200;

/**
 * Tras cada cambio en la biblioteca, intenta escribir `public/content-library-seed.json`
 * (solo funciona en `npm run dev` en tu máquina).
 */
export function ContentLibraryAutoSync() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void syncContentLibraryToProjectFile().then((r) => {
          if (!r.ok && r.message) {
            // En producción es 403 esperado; no molestar
            if (process.env.NODE_ENV === "development") {
              console.warn("[content-library]", r.message);
            }
          }
        });
      }, DEBOUNCE_MS);
    };

    window.addEventListener(CONTENT_LIBRARY_UPDATED_EVENT, schedule);
    return () => {
      window.removeEventListener(CONTENT_LIBRARY_UPDATED_EVENT, schedule);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
