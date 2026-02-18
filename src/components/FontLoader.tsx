"use client";

import { useEffect, useState } from "react";

/**
 * Carga la fuente Bitter en el cliente para no fallar en el servidor.
 */
export function FontLoader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    setMounted(true);
  }, []);
  return null;
}
