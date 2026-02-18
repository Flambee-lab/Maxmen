"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Background } from "@/components/game/Background";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";

interface GameDescriptionScreenProps {
  highScore?: number;
  difficulty?: number;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  /** Cuando se usa dentro de GameContainer, inicia la etapa coach en lugar de navegar */
  onStart?: () => void;
  /** Si true, no renderiza Background (lo provee el padre) */
  embedded?: boolean;
}

export function GameDescriptionScreen({
  highScore = 0,
  difficulty = 4,
  isMuted = false,
  onMuteToggle = () => {},
  onStart,
  embedded = false,
}: GameDescriptionScreenProps) {
  const router = useRouter();
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);

  const handleStartGame = () => {
    if (onStart) onStart();
    else router.push("/game");
  };

  const handleClose = () => {
    router.push("/");
  };

  const content = (
    <>
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Top Right Icons - Same position as TopHUD */}
        <div
          className="absolute right-6 z-20"
          style={{
            top: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <SoundButton isMuted={isMuted} onClick={onMuteToggle} />
          <CloseButton onClick={handleClose} />
        </div>

        {/* Contenedor principal centrado - sin scroll */}
        <main className="w-full flex flex-col items-center justify-center max-w-2xl py-8">
          {/* Game Concept Illustration - centrada en viewport */}
          <div className="w-full flex items-center justify-center">
            <Image
              src="/intro/concept.png"
              alt="Game concept illustration"
              width={312}
              height={180}
              style={{
                width: "312px",
                height: "180px",
                objectFit: "contain",
                display: "block",
              }}
              priority
            />
          </div>

          {/* Game Title - 44px desde ilustración, centrado */}
          <h1
            className="w-full text-center text-white"
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 700,
              fontSize: "48px",
              color: "#FFFFFF",
              marginTop: "44px",
            }}
          >
            Remind
          </h1>

          {/* Stats Section: HighScore | [línea + icono] | Difficulty — una sola línea central */}
          <div className="relative flex items-center justify-center w-full" style={{ marginTop: "40px", paddingBottom: "20px" }}>
            {/* High Score */}
            <div className="flex flex-col items-center">
              <span
                className="text-white"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 600,
                  fontSize: "32px",
                  color: "#FFFFFF",
                  marginBottom: "8px",
                }}
              >
                {highScore}
              </span>
              <span
                className="text-white/80"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.80)",
                }}
              >
                High score
              </span>
            </div>

            {/* Columna central: una sola línea (+12px) + ícono info tocando la línea */}
            <div
              className="flex flex-col items-center"
              style={{ marginLeft: "32px", marginRight: "32px" }}
            >
              <div
                style={{
                  width: "1px",
                  height: "76px",
                  backgroundColor: "rgba(255, 255, 255, 0.20)",
                }}
              />
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    color: "#284D79",
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-bitter), serif",
                  }}
                >
                  i
                </span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2" style={{ marginBottom: "8px" }}>
                <span
                  className="text-white"
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 600,
                    fontSize: "32px",
                    color: "#FFFFFF",
                  }}
                >
                  {difficulty}/{difficulty}
                </span>
                <button
                  type="button"
                  onClick={() => setIsDifficultyModalOpen(true)}
                  className="flex items-center justify-center"
                  aria-label="Edit difficulty"
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <Image
                    src="/intro/difficulty-icon.png"
                    alt="Difficulty"
                    width={40}
                    height={40}
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "block",
                    }}
                  />
                </button>
              </div>
              <span
                className="text-white/80"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 600,
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.80)",
                }}
              >
                Difficulty
              </span>
            </div>
          </div>

          {/* Game Description - 16px desde info icon, centrado */}
          <p
            className="mx-auto max-w-md text-center"
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 500,
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.80)",
              lineHeight: "1.5",
              marginTop: "16px",
            }}
          >
            You will be shown a series of pictures and a list of options to match
            them. The faster you match, the better your score.
          </p>

          {/* Start Game Button - 32px desde párrafo, centrado */}
          <GamePrimaryButton
            className="mx-auto"
            style={{ marginTop: "32px" }}
            onClick={handleStartGame}
          >
            Start Game
          </GamePrimaryButton>
        </main>
      </div>

      {/* Difficulty Modal */}
      {isDifficultyModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsDifficultyModalOpen(false)}
        >
          <div
            className="bg-[#284B79] border-2 border-white/20 rounded-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-white text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                }}
              >
                Difficulty
              </h2>
              <button
                type="button"
                onClick={() => setIsDifficultyModalOpen(false)}
                className="text-white hover:text-white/80"
                aria-label="Close"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p
              className="text-white/80 mb-6"
              style={{
                fontFamily: "var(--font-bitter), serif",
              }}
            >
              Difficulty options will be implemented here.
            </p>
            <button
              type="button"
              onClick={() => setIsDifficultyModalOpen(false)}
              className="w-full px-6 py-3 bg-white/20 border border-white/20 rounded-lg text-white hover:bg-white/30"
              style={{
                fontFamily: "var(--font-bitter), serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) return content;
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      {content}
    </div>
  );
}
