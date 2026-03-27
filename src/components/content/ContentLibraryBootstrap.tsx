"use client";

import { useEffect } from "react";
import { tryHydrateContentLibraryFromPublicSeed } from "@/lib/contentLibrary/hydrateSeed";

/**
 * Una vez al cargar la app: si no hay nada en localStorage, aplica la semilla
 * desde `public/content-library-seed.json` (si existe y tiene ítems).
 */
export function ContentLibraryBootstrap() {
  useEffect(() => {
    void tryHydrateContentLibraryFromPublicSeed();
  }, []);

  return null;
}
