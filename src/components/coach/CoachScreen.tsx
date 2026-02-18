"use client";

interface CoachScreenProps {
  onContinue: () => void;
}

/**
 * Etapa intermedia: coach marks / instrucciones guiadas.
 * Placeholder hasta diseñar la pantalla.
 */
export function CoachScreen({ onContinue }: CoachScreenProps) {
  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6">
      <p
        className="text-center text-white/80 mb-8"
        style={{
          fontFamily: "var(--font-bitter), serif",
          fontSize: "24px",
        }}
      >
        Coach / instrucciones guiadas (próximamente)
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="px-8 py-4 rounded-lg text-white border border-white/20"
        style={{
          fontFamily: "var(--font-bitter), serif",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Continue
      </button>
    </div>
  );
}
