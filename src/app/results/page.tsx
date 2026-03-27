"use client";

import { useRouter } from "next/navigation";
import { ResultsScreen } from "@/components/results";

/**
 * Vista rápida de la pantalla de resultados (diseño estático) sin pasar por el flujo del juego.
 * Abre: http://localhost:3000/results
 */
export default function ResultsPreviewPage() {
  const router = useRouter();
  return (
    <ResultsScreen
      onReplay={() => router.push("/game")}
      onNewCategory={() => router.push("/game")}
    />
  );
}
