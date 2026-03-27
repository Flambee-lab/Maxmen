"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Background } from "@/components/game/Background";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { playClickSfx } from "@/lib/clickSfx";
import { IntroIllustrationSvg } from "@/components/intro/IntroIllustrationSvg";
import type { GameDifficulty } from "@/types/game";
import { DEFAULT_SECONDS_PER_ROUND } from "@/lib/gameRoundConfig";

const DIFFICULTY_OPTIONS: ReadonlyArray<{ value: GameDifficulty; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const DIFFICULTY_LABEL: Record<GameDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const IMAGES_PER_ROUND_LABEL: Record<GameDifficulty, string> = {
  easy: "3 images per round",
  medium: "4 images per round",
  hard: "5 images per round",
};

/** Panel del listado (no usar <select>: el OS pinta fondo negro y otra tipografía) */
const difficultyDropdownPanelStyle: CSSProperties = {
  border: "2px solid rgba(255, 255, 255, 0.38)",
  background:
    "linear-gradient(180deg, rgba(21, 60, 113, 0.97) 0%, rgba(18, 48, 90, 0.98) 50%, rgba(15, 40, 78, 0.99) 100%)",
  boxShadow:
    "0 16px 48px rgba(0, 0, 0, 0.45), 0 0 24px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
  backdropFilter: "blur(14px)",
};

const difficultyOptionTypography: CSSProperties = {
  fontFamily: "var(--font-bitter), serif",
  fontWeight: 700,
  fontSize: "24px",
  lineHeight: 1,
  color: "#FFFFFF",
};

/** Mismo tono que `tipText` en `/game` (Specs paso 1) + resumen de la intro */
const INTRO_INFO_TIP_PARAGRAPHS: readonly string[] = [
  "A question will appear above a group of your memory images. Quickly match each answer to its correct image. Try to get the fastest perfect score.",
  "Match each photo with best answer to the question. Be fast.",
];

/** Quick Play + selector de dificultad: mismo shell secundario (hover coherente) */
function getSecondaryInteractiveShellStyle(hovered: boolean): CSSProperties {
  return {
    borderRadius: "32px",
    cursor: "pointer",
    border: hovered
      ? "2px solid rgba(255, 255, 255, 0.52)"
      : "2px solid rgba(255, 255, 255, 0.40)",
    background: hovered
      ? "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.22) 42.3%)"
      : "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.15) 42.3%)",
    boxShadow: hovered
      ? "0 0 28px rgba(255, 255, 255, 0.12), 0 0 1px rgba(255, 255, 255, 0.35), 0 46px 34px 0 rgba(0, 0, 0, 0.12), 0 -16px 16px 0 rgba(255, 255, 255, 0.14) inset, 0 2px 4px 0 rgba(0, 0, 0, 0.12) inset"
      : "0 0 20px rgba(255, 255, 255, 0.07), 0 42px 32.4px 0 rgba(0, 0, 0, 0.10), 0 -14px 14.2px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 0 0 rgba(255, 255, 255, 0.14) inset",
    transition:
      "background 160ms ease-out, box-shadow 180ms ease-out, border-color 160ms ease-out",
  };
}

interface GameDescriptionScreenProps {
  isMuted?: boolean;
  onMuteToggle?: () => void;
  onCustomStart?: (settings: {
    secondsPerRound: number;
    difficulty: GameDifficulty;
  }) => void;
  onQuickPlayStart?: (settings: {
    secondsPerRound: number;
    difficulty: GameDifficulty;
  }) => void;
  /** Si true, no renderiza Background (lo provee el padre) */
  embedded?: boolean;
}

export function GameDescriptionScreen({
  isMuted = false,
  onMuteToggle = () => {},
  onCustomStart,
  onQuickPlayStart,
  embedded = false,
}: GameDescriptionScreenProps) {
  const router = useRouter();

  /** Segundos por ronda: no usar highScore (podía ser 60 u otro valor y pisar la duración). */
  const [secondsPerRound, setSecondsPerRound] = useState(DEFAULT_SECONDS_PER_ROUND);
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");
  const [difficultyHovered, setDifficultyHovered] = useState(false);
  const [difficultyMenuOpen, setDifficultyMenuOpen] = useState(false);
  const [quickPlayHovered, setQuickPlayHovered] = useState(false);
  const [introInfoOpen, setIntroInfoOpen] = useState(false);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!introInfoOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIntroInfoOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [introInfoOpen]);

  useEffect(() => {
    if (!difficultyMenuOpen) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const el = difficultyDropdownRef.current;
      if (el && !el.contains(e.target as Node)) {
        setDifficultyMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDifficultyMenuOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [difficultyMenuOpen]);

  const MIN_SECONDS = DEFAULT_SECONDS_PER_ROUND;
  const MAX_SECONDS = 120;
  const STEP_SECONDS = 1;

  const clampSeconds = (n: number) =>
    Math.max(MIN_SECONDS, Math.min(MAX_SECONDS, n));

  /** Misma tipografía en “Fastest Perfect Score” y la etiqueta bajo dificultad */
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
      <div className="relative z-10 flex h-[100dvh] max-h-[100dvh] min-h-0 w-full flex-col items-center overflow-hidden px-6 intro-screen-enter">
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

        {/* Mismo flujo y espaciados que el diseño original; solo viewport fijo (100dvh) para evitar scroll */}
        <main className="flex min-h-0 w-full max-w-2xl flex-1 flex-col items-center overflow-hidden py-8">
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
              {/* Fila 1: celda izquierda vacía; segundos/ronda centrados sobre el texto de abajo (col 2) */}
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
                    fontWeight: 700,
                    fontSize: "24px",
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
              {/* Info al final del divisor vertical — abre modal (mismo copy que tip en Specs / game) */}
              <button
                type="button"
                className="game-focus-visible flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "#FFFFFF",
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
                aria-label="How to play"
                onClick={() => {
                  playClickSfx();
                  setDifficultyMenuOpen(false);
                  setIntroInfoOpen(true);
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
              </button>
            </div>

              <div className="flex min-h-0 min-w-0 flex-1 justify-start pl-4 sm:pl-5">
            <div
              className="relative flex w-full max-w-[240px] shrink-0 flex-col items-center"
            >
              {/* Difficulty: listado custom (el <select> nativo usa UI del SO: fondo negro, otra tipografía) */}
              <div
                ref={difficultyDropdownRef}
                className="relative w-full"
                style={{ zIndex: difficultyMenuOpen ? 50 : undefined }}
                onMouseEnter={() => setDifficultyHovered(true)}
                onMouseLeave={() => setDifficultyHovered(false)}
              >
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={difficultyMenuOpen}
                  aria-label="Select difficulty"
                  className="game-focus-visible content-stretch flex w-full flex-col items-center justify-center"
                  onClick={() => {
                    setDifficultyMenuOpen((o) => !o);
                  }}
                  style={{
                    width: "100%",
                    height: "62px",
                    padding: "6px 12px",
                    boxSizing: "border-box",
                    ...getSecondaryInteractiveShellStyle(
                      difficultyHovered || difficultyMenuOpen
                    ),
                  }}
                >
                  <div
                    className="relative flex w-full items-center justify-center"
                    style={{ height: "100%" }}
                  >
                    <span
                      style={{
                        ...difficultyOptionTypography,
                        textAlign: "center",
                        width: "100%",
                        paddingLeft: "32px",
                        paddingRight: "32px",
                        boxSizing: "border-box",
                      }}
                    >
                      {DIFFICULTY_LABEL[difficulty]}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: difficultyMenuOpen
                          ? "translateY(-50%) rotate(180deg)"
                          : "translateY(-50%)",
                        transition: "transform 160ms ease-out",
                        pointerEvents: "none",
                        display: "flex",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 10l5 5 5-5"
                          stroke={
                            difficultyHovered || difficultyMenuOpen
                              ? "rgba(255,255,255,1)"
                              : "rgba(255,255,255,0.9)"
                          }
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </button>
                {difficultyMenuOpen ? (
                  <ul
                    role="listbox"
                    aria-label="Difficulty"
                    className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl py-1"
                    style={difficultyDropdownPanelStyle}
                  >
                    {DIFFICULTY_OPTIONS.map(({ value: opt, label }) => {
                      const selected = difficulty === opt;
                      return (
                        <li key={opt} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`game-focus-visible w-full border-0 text-center transition-colors hover:bg-white/[0.08] ${
                              selected ? "bg-white/[0.12]" : "bg-transparent"
                            }`}
                            style={{
                              ...difficultyOptionTypography,
                              padding: "12px 16px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setDifficulty(opt);
                              setDifficultyMenuOpen(false);
                              playClickSfx();
                            }}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <div
                className="relative shrink-0 w-full flex items-center justify-center"
                style={{
                  marginTop: "6px",
                  height: "28px",
                }}
              >
                <span style={controlsBottomLabelStyle}>
                  {IMAGES_PER_ROUND_LABEL[difficulty]}
                </span>
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
              A question will appear above a group of your memory images. Quickly
              match each answer to its correct image.
            </span>
            <span style={{ display: "block" }}>
              Try to get the fastest perfect score.
            </span>
          </p>

          {/* Bottom Buttons */}
          <div
            className="mt-auto flex w-full items-center justify-center"
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
                  onMouseEnter={() => setQuickPlayHovered(true)}
                  onMouseLeave={() => setQuickPlayHovered(false)}
                  style={{
                    width: "240px",
                    height: "68px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-bitter), serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    ...getSecondaryInteractiveShellStyle(quickPlayHovered),
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
                    fontWeight: 700,
                    fontSize: "24px",
                    lineHeight: 1,
                    color: "#FFFFFF",
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

      {introInfoOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
          style={{
            background: "rgba(0, 0, 0, 0.52)",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setIntroInfoOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-tip-title"
            className="flex w-full max-w-[min(92vw,440px)] max-h-[min(85dvh,620px)] flex-col overflow-y-auto rounded-[24px] p-6 sm:p-8"
            style={difficultyDropdownPanelStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: TIP + close en una sola fila */}
            <header className="flex shrink-0 items-center justify-between gap-4">
              <h2
                id="intro-tip-title"
                className="min-w-0 truncate"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "24px",
                  lineHeight: 1,
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                TIP
              </h2>
              <div className="shrink-0">
                <CloseButton onClick={() => setIntroInfoOpen(false)} />
              </div>
            </header>

            {/* Body: texto alineado a la izquierda */}
            <div className="mt-6 min-h-0 w-full space-y-3">
              {INTRO_INFO_TIP_PARAGRAPHS.map((text, i) => (
                <p
                  key={`intro-info-${i}`}
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.80)",
                    lineHeight: 1.5,
                    margin: 0,
                    textAlign: "left",
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) return content;
  return (
    <div className="relative h-[100dvh] max-h-[100dvh] overflow-hidden">
      <Background />
      {content}
    </div>
  );
}
