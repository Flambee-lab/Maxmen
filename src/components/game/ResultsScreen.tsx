"use client";

export interface ResultsScreenProps {
  /** Placeholder para futura navegación (ej. volver al menú o siguiente flujo) */
  onContinue?: () => void;
}

export function ResultsScreen({ onContinue }: ResultsScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      <h1
        className="text-3xl font-bold text-white mb-4"
        style={{ fontFamily: "var(--font-bitter), serif" }}
      >
        Results
      </h1>
      <p className="text-white/80 text-center max-w-md" style={{ fontFamily: "var(--font-bitter), serif" }}>
        Pantalla de resultados (placeholder). Aquí irá el resumen de la partida.
      </p>
      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-8 px-6 py-3 rounded-2xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
          style={{ fontFamily: "var(--font-bitter), serif" }}
        >
          Continue
        </button>
      )}
    </div>
  );
}
