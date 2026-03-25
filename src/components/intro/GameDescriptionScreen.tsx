"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/components/game/Background";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { playClickSfx } from "@/lib/clickSfx";
import { IntroIllustrationSvg } from "@/components/intro/IntroIllustrationSvg";

interface GameDescriptionScreenProps {
  highScore?: number;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  onCustomStart?: (settings: {
    secondsPerRound: number;
    difficulty: "easy" | "medium";
  }) => void;
  onQuickPlayStart?: (settings: {
    secondsPerRound: number;
    difficulty: "easy" | "medium";
  }) => void;
  /** Si true, no renderiza Background (lo provee el padre) */
  embedded?: boolean;
}

export function GameDescriptionScreen({
  highScore = 0,
  isMuted = false,
  onMuteToggle = () => {},
  onCustomStart,
  onQuickPlayStart,
  embedded = false,
}: GameDescriptionScreenProps) {
  const router = useRouter();

  const defaultSeconds = typeof highScore === "number" && highScore > 0 ? highScore : 58;
  const [secondsPerRound, setSecondsPerRound] = useState(defaultSeconds);
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("medium");

  const MIN_SECONDS = 30;
  const MAX_SECONDS = 120;
  const STEP_SECONDS = 1;

  const clampSeconds = (n: number) =>
    Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, n));

  /** Misma tipografía en “Fastest Perfect Score” y “4 images per round” */
  const controlsBottomLabelStyle: CSSProperties = {
    fontFamily: "var(--font-bitter), serif",
    fontWeight: 600,
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.80)",
    lineHeight: 1,
    letterSpacing: "0.4px",
    whiteSpace: "nowrap",
  };

  const handleCustomGame = () => {
    const settings = { secondsPerRound, difficulty };
    playClickSfx();
    onCustomStart?.(settings);
    if (!onCustomStart) router.push("/game");
  };

  const handleQuickPlay = () => {
    const settings = { secondsPerRound, difficulty };
    playClickSfx();
    onQuickPlayStart?.(settings);
    if (!onQuickPlayStart) router.push("/game");
  };

  const handleClose = () => {
    router.push("/");
  };

  const content = (
    <>
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-start px-6 overflow-hidden intro-screen-enter">
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

        {/* Contenedor principal (permite que los botones vayan abajo con mt-auto) */}
        <main className="w-full flex flex-col items-center max-w-2xl py-8 flex-1">
          {/* Game Concept Illustration - centrada en viewport (SVG inline para poder interactuar con elementos) */}
          <div className="w-full flex items-center justify-center" style={{ width: "312px", height: "180px" }}>
            <IntroIllustrationSvg
              className="block"
              style={{ width: "312px", height: "180px", objectFit: "contain" }}
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
          {/* Controls Row: dos mitades iguales (flex-1) para centrar el divisor; cajas ≤300px alineadas al centro */}
          <div
            className="w-full min-w-0"
            style={{
              marginTop: "40px",
              paddingBottom: "20px",
            }}
          >
            <div className="flex w-full min-w-0 items-start justify-center gap-0">
              <div className="flex min-h-0 min-w-0 flex-1 justify-end pr-4 sm:pr-5">
            {/* Grid: ancho al contenido (w-max) para pegar el bloque al divisor; col2 max-content; 8px estrella–texto */}
            <div
              className="relative w-max max-w-[300px] shrink-0"
              style={{
                display: "grid",
                gridTemplateColumns: "28px max-content",
                columnGap: "8px",
                gridTemplateRows: "68px 28px",
                alignItems: "center",
              }}
            >
              {/* Fila 1: celda izquierda vacía; “58 sec” centrado sobre el texto de abajo (col 2) */}
              <div
                aria-hidden
                style={{
                  gridColumn: 1,
                  gridRow: 1,
                }}
              />
              <div
                style={{
                  gridColumn: 2,
                  gridRow: 1,
                  padding: "8px 12px",
                  height: "68px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255, 255, 255, 0)",
                  borderRadius: "32px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 600,
                    fontSize: "32px",
                    color: "#FFFFFF",
                    textAlign: "center",
                    lineHeight: "1",
                  }}
                >
                  {secondsPerRound} sec
                </span>
              </div>

              {/* Fila 2: estrella | texto */}
              <div
                style={{
                  gridColumn: 1,
                  gridRow: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path
                    d="M12 2l2.9 6.9L22 9.6l-5 4.4L18.2 21 12 17.6 5.8 21 7 14 2 9.6l7.1-0.7L12 2z"
                    fill="#FFD700"
                    opacity="0.9"
                  />
                </svg>
              </div>
              <div
                style={{
                  gridColumn: 2,
                  gridRow: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "28px",
                  boxSizing: "border-box",
                }}
              >
                <span style={controlsBottomLabelStyle}>Fastest Perfect Score</span>
              </div>
            </div>
              </div>

            {/* Divider + info icon (altura alineada al bloque sec / fastest) */}
            <div
              className="flex flex-col items-center justify-between shrink-0"
              style={{ width: "32px", height: "96px" }}
            >
              <div
                style={{
                  width: "1px",
                  backgroundColor: "rgba(255, 255, 255, 0.20)",
                  flexGrow: 1,
                }}
              />
              {/* Info al final del divisor vertical */}
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

              <div className="flex min-h-0 min-w-0 flex-1 justify-start pl-4 sm:pl-5">
            <div
              className="relative flex w-full max-w-[300px] shrink-0 flex-col items-center"
            >
              {/* Difficulty dropdown */}
              <div
                className="border-2 border-[rgba(255,255,255,0.2)] border-solid rounded-[32px] content-stretch flex flex-col items-center justify-center"
                style={{
                  width: "100%",
                  height: "68px",
                  padding: "8px 12px",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div
                  className="relative flex items-center justify-center w-full"
                  style={{ height: "100%" }}
                >
                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        (e.target.value as "easy" | "medium") || "medium"
                      )
                    }
                    className="appearance-none bg-transparent text-white"
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontWeight: 600,
                      fontSize: "32px",
                      lineHeight: "1",
                      color: "#FFFFFF",
                      textAlign: "center",
                      width: "100%",
                      height: "100%",
                      outline: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      display: "block",
                    }}
                    aria-label="Select difficulty"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                  </select>
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className="relative shrink-0 w-full flex items-center justify-center"
                style={{
                  marginTop: "0px",
                  height: "28px",
                }}
              >
                <span style={controlsBottomLabelStyle}>4 images per round</span>
              </div>
            </div>
              </div>
            </div>
          </div>

          {/* Game Description: ancho amplio para ~3 líneas en desktop */}
          <p
            className="mx-auto text-center w-full"
            style={{
              maxWidth: "min(1100px, 94vw)",
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 500,
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.80)",
              lineHeight: "1.45",
              marginTop: "8px",
            }}
          >
            <span style={{ display: "block" }}>
              A question will appear above a group of your memory images.Quickly
              match each answer to its correct image.
            </span>
            <span style={{ display: "block" }}>
              Try to get the fastest perfect score.
            </span>
          </p>

          {/* Bottom Buttons */}
          <div
            className="w-full flex items-center justify-center mt-auto"
            style={{ paddingBottom: "32px", paddingTop: "24px" }}
          >
            <div className="flex items-start justify-center gap-[24px]">
              {/* Izquierda: Quick Play + Random Memory Challenge */}
              <div
                className="flex flex-col items-center shrink-0"
                style={{ width: "240px" }}
              >
                <button
                  type="button"
                  onClick={() => handleQuickPlay()}
                  className="game-focus-visible"
                  style={{
                    width: "240px",
                    height: "68px",
                    borderRadius: "32px",
                    border: "2px solid rgba(255, 255, 255, 0.40)",
                    background:
                      "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.15) 42.3%)",
                    boxShadow:
                      "0 42px 32.4px 0 rgba(0, 0, 0, 0.10), 0 -14px 14.2px 0 rgba(255, 255, 255, 0.10) inset",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontFamily: "var(--font-bitter), serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  Quick Play
                </button>
                <p
                  style={{
                    marginTop: "16px",
                    marginBottom: 0,
                    width: "100%",
                    textAlign: "center",
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: 1.3,
                    color: "rgba(255, 255, 255, 0.80)",
                  }}
                >
                  Random Memory Challenge
                </p>
              </div>

              <div
                className="flex shrink-0 items-center justify-center"
                style={{ height: "68px" }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 500,
                    fontSize: "24px",
                    color: "rgba(255, 255, 255, 0.80)",
                    margin: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  or
                </p>
              </div>

              {/* Derecha: Focus Game (flujo custom / focus groups) */}
              <div
                className="flex shrink-0 items-center justify-center"
                style={{ height: "68px" }}
              >
                <GamePrimaryButton
                  onClick={handleCustomGame}
                  style={{ width: "240px" }}
                >
                  Focus Game
                </GamePrimaryButton>
              </div>
            </div>
          </div>
        </main>
      </div>
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
