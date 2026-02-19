import { GamePrimaryButton } from "./GamePrimaryButton";
import { CloseButton } from "./CloseButton";
import { RevealAnswersButton } from "./RevealAnswersButton";

interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Overlay con blur y oscurecido, dejando ver el juego detrás */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-[42px]" />

      {/* Botón Close reutilizando el mismo componente global */}
      <div className="absolute top-8 right-8">
        <CloseButton onClick={onResume} />
      </div>

      {/* Contenido principal del modal */}
      <div className="relative z-10 flex flex-col items-center w-[320px] gap-6">
        <h2
          className="text-white text-center"
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 600,
            fontSize: "40px",
            lineHeight: "40px",
            marginTop: "100px",
          }}
        >
          Paused
        </h2>

        {/* Botones principales (Resume / Restart / Close Game) */}
        <div className="flex flex-col w-full gap-3">
          <GamePrimaryButton onClick={onResume}>Resume</GamePrimaryButton>
          <GamePrimaryButton onClick={() => console.log("restart")}>
            Restart
          </GamePrimaryButton>
          <GamePrimaryButton onClick={onQuit}>Close Game</GamePrimaryButton>
        </div>

        {/* Botón secundario: See tutorial (UI tipo Reveal Answers, respetando layout actual) */}
        <button
          type="button"
          onClick={() => console.log("see tutorial")}
          className="mt-2 rounded-[32px]"
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 600,
            fontSize: "20px",
            color: "#FFFFFF",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            // Mantener tamaño aproximado actual (no copiamos height/padding de Reveal)
            padding: "12px 32px",
            borderTop: "2px solid rgba(255, 255, 255, 0.20)",
            borderRight: "2px solid rgba(255, 255, 255, 0.20)",
            borderLeft: "2px solid rgba(255, 255, 255, 0.20)",
            borderBottom: "none",
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.00) 24.06%, rgba(255, 255, 255, 0.10) 100%)",
            backgroundBlendMode: "screen",
            boxSizing: "border-box",
          }}
        >
          See tutorial
        </button>
      </div>

      {/* Botón Reveal Answers también visible en la pantalla de pausa, pegado al bottom */}
      <div
        className="absolute left-1/2"
        style={{ bottom: 0, transform: "translateX(-50%)" }}
      >
        <RevealAnswersButton onClick={() => console.log("reveal-from-pause")} />
      </div>
    </div>
  );
}
