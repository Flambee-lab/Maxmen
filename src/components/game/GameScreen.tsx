"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState } from "@/types/game";
import { mockCards, mockChips } from "@/mocks/gameMocks";
import { Background } from "./Background";
import { TopHUD } from "./TopHUD";
import { GameInstruction } from "./GameInstruction";
import { CardStage } from "./CardStage";
import { ChipRow } from "./ChipRow";
import { RevealAnswersButton } from "./RevealAnswersButton";
import { PauseMenu } from "./PauseMenu";
import { SuccessScreen } from "./SuccessScreen";
import { DragArrowOverlay } from "./DragArrowOverlay";
import { GamePrimaryButton } from "./GamePrimaryButton";
import Image from "next/image";

interface DragState {
  nameId: string;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
}

type GameMode = "play" | "reveal";

interface GameScreenProps {
  /** Si true, no renderiza Background (lo provee GameContainer) */
  skipBackground?: boolean;
}

/** Mapping correcto: chipName -> cardId */
const CORRECT_MAPPING: Record<string, string> = {
  // Orden físico de izquierda a derecha:
  // card-1 (primera izquierda), card-2 (segunda izquierda),
  // card-3 (segunda derecha), card-4 (extremo derecho)
  Tom: "card-1",
  Ian: "card-2",
  Catherine: "card-3",
  // Tanto "Justin" (nombre real del chip en mocks) como "Justine" (label esperado)
  // deben ser correctos solo para la card más a la derecha.
  Justin: "card-4",
  Justine: "card-4",
};

const INCORRECT_RESET_DELAY = 5000; // 5 segundos
const CORRECT_FEEDBACK_DELAY = 5000; // 5 segundos

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075; // música ambiental baja
const SFX_VOLUME = 0.55; // SFX claramente por encima de la música

/** Crea o reanuda el AudioContext en el primer gesto del usuario */
async function getAudioContext(audioContextRef: React.MutableRefObject<AudioContext | null>): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  let ctx = audioContextRef.current;
  if (!ctx) {
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioContextRef.current = ctx;
  }
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

/** Fallback: tono suave en loop cuando no existe lofi.mp3 */
async function startFallbackBgMusic(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  gainRef: React.MutableRefObject<GainNode | null>
): Promise<() => void> {
  const ctx = await getAudioContext(audioContextRef);
  if (!ctx) return () => {};
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0.048; // ~20% menos que antes; coherente con BG_VOLUME
  gainRef.current = gain;
  osc.type = "sine";
  osc.frequency.value = 110;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  return () => {
    try {
      osc.stop();
      gain.disconnect();
    } catch (_) {}
    gainRef.current = null;
  };
}

/** Fallback: sonidos con Web Audio API cuando no hay archivos MP3 */
function playFallbackSfx(
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  type: "correct" | "incorrect" | "drag" | "complete"
) {
  getAudioContext(audioContextRef).then((ctx) => {
    if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  const freq = type === "correct" ? 523 : type === "incorrect" ? 220 : type === "drag" ? 330 : 659;
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.15);
  });
}

export function GameScreen({ skipBackground = false }: GameScreenProps = {}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardStatus, setCardStatus] = useState<Record<string, "correct" | "incorrect" | "idle">>({});
  const [resolvedByCard, setResolvedByCard] = useState<Record<string, string>>({}); // cardId -> chipName
  const [cardFeedback, setCardFeedback] = useState<Record<string, "idle" | "incorrect" | "correct">>({}); // cardId -> feedback temporal
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>("play");
  const connectSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  const resetTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const correctFeedbackTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackBgStopRef = useRef<(() => void) | null>(null);
  const fallbackGainRef = useRef<GainNode | null>(null);
  const useFallbackRef = useRef(false);
  const sfxRefs = useRef<Record<string, HTMLAudioElement>>({});
  const mutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [gameState, setGameState] = useState<GameState>(() => {
    let isMuted = false;
    if (typeof window !== "undefined") {
      try {
        isMuted = localStorage.getItem(MUTED_STORAGE_KEY) === "true";
      } catch (_) {}
    }
    return {
      round: 1,
      lives: 5,
      isPaused: false,
      isMuted,
      selectedCardId: null,
      selectedChipId: null,
      hoveredNameId: null,
      draggingNameId: null,
      dragState: null,
      cards: mockCards,
      chips: mockChips,
      connections: [],
      showSuccess: false,
    };
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showCardsAndChips, setShowCardsAndChips] = useState(false);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [aimPos, setAimPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    mutedRef.current = gameState.isMuted;
  }, [gameState.isMuted]);

  // Música de fondo: arranca sola al entrar (autoplay); si el navegador bloquea, primer pointerdown. No vinculada al botón. No se detiene nunca.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/lofi.mp3");
    audio.loop = true;
    audio.volume = BG_VOLUME;
    bgAudioRef.current = audio;

    let startOnInteraction: (() => void) | null = null;

    const tryPlay = () => {
      audio.play().catch(() => {
        startOnInteraction = () => {
          audio.play().catch(() => {});
          if (startOnInteraction) window.removeEventListener("pointerdown", startOnInteraction);
        };
        window.addEventListener("pointerdown", startOnInteraction);
      });
    };

    const onError = () => {
      if (!fallbackGainRef.current) {
        useFallbackRef.current = true;
        startFallbackBgMusic(audioContextRef, fallbackGainRef).then((stop) => {
          if (stop) fallbackBgStopRef.current = stop;
        });
      }
    };

    audio.addEventListener("error", onError);
    audio.addEventListener("canplaythrough", tryPlay, { once: true });
    tryPlay();

    return () => {
      audio.removeEventListener("error", onError);
      if (startOnInteraction) window.removeEventListener("pointerdown", startOnInteraction);
      fallbackBgStopRef.current?.();
      fallbackBgStopRef.current = null;
      fallbackGainRef.current = null;
      useFallbackRef.current = false;
      audio.pause();
      audio.currentTime = 0;
      bgAudioRef.current = null;
    };
  }, []);

  // Secuencia de entrada: primero título (fade-in), luego cards + chips
  useEffect(() => {
    const t = setTimeout(() => setShowCardsAndChips(true), 500);
    return () => clearTimeout(t);
  }, []);

  function getSfx(type: "correct" | "incorrect" | "drag" | "complete"): HTMLAudioElement {
    if (!sfxRefs.current[type]) {
      const audio = new Audio(`/audio/sfx/${type}.mp3`);
      audio.volume = SFX_VOLUME;
      audio.preload = "auto";
      sfxRefs.current[type] = audio;
    }
    return sfxRefs.current[type];
  }

  const playSfx = useCallback((type: "correct" | "incorrect" | "drag" | "complete") => {
    const sfx = getSfx(type);
    sfx.currentTime = 0;
    sfx.play().catch(() => {
      playFallbackSfx(audioContextRef, type);
    });
  }, []);

  // El botón arriba a la derecha es para subtítulos, no para audio; la música no se detiene nunca.

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
    // Mantener gameState.isPaused sincronizado por si otros sistemas lo usan
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleMuteToggle = () => {
    setGameState((prev) => {
      const next = !prev.isMuted;
      try {
        localStorage.setItem(MUTED_STORAGE_KEY, next ? "true" : "false");
      } catch (_) {}
      return { ...prev, isMuted: next };
    });
  };

  const handleChipHover = useCallback((nameId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      hoveredNameId: nameId,
    }));
  }, []);

  const handleChipClick = useCallback((chipId: string) => {
    setGameState((prev) => ({
      ...prev,
      selectedChipId: prev.selectedChipId === chipId ? null : chipId,
    }));

    if (activeChipId === chipId) {
      setActiveChipId(null);
      setAimPos(null);
      setActiveCardId(null);
      return;
    }

    setActiveChipId(chipId);
    setAimPos(null);
    setActiveCardId(null);
    playSfx("drag");
  }, [activeChipId, playSfx]);

  const registerConnectSlot = useCallback(
    (cardId: string, element: HTMLDivElement | null) => {
      if (element) {
        connectSlotsRef.current.set(cardId, element);
      } else {
        connectSlotsRef.current.delete(cardId);
      }
    },
    []
  );

  const registerChipRef = useCallback(
    (nameId: string, element: HTMLDivElement | null) => {
      if (element) {
        chipRefs.current.set(nameId, element);
      } else {
        chipRefs.current.delete(nameId);
      }
    },
    []
  );

  // Cleanup: limpiar todos los timeouts pendientes al desmontar
  useEffect(() => {
    return () => {
      Object.values(resetTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
      Object.values(correctFeedbackTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);

  // Mousemove global mientras hay chip activo: actualizar endpoint de la flecha (aimPos)
  useEffect(() => {
    if (!activeChipId) {
      setAimPos(null);
      setActiveCardId(null);
      return;
    }

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // coords en viewport
      let x = e.clientX;
      let y = e.clientY;

      // clamp al rect del canvas
      x = Math.max(rect.left, Math.min(x, rect.right));
      y = Math.max(rect.top, Math.min(y, rect.bottom));

      let endX = x;
      let endY = y;
      let hovered: string | null = null;

      // Detectar slot/card bajo el cursor usando coords de viewport
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const slot = el?.closest('[data-connect-slot="true"]') as HTMLElement | null;
      if (slot) {
        const r = slot.getBoundingClientRect();
        endX = r.left + r.width / 2;
        endY = r.top + r.height / 2;
        const slotCardId = slot.getAttribute("data-card-id");
        if (slotCardId && slotCardId.startsWith("card-") && !resolvedByCard[slotCardId]) {
          hovered = slotCardId;
        }
      } else if (el) {
        const cardEl = el.closest('[data-card-id]') as HTMLElement | null;
        const cardId = cardEl?.getAttribute("data-card-id") ?? null;
        if (cardId && cardId.startsWith("card-") && !resolvedByCard[cardId]) {
          hovered = cardId;
        }
      }

      setActiveCardId(hovered);
      // Guardamos en coords de viewport (las usa directamente el SVG)
      setAimPos({ x: endX, y: endY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeChipId, resolvedByCard]);

  // ESC cancela aiming
  useEffect(() => {
    if (!activeChipId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveChipId(null);
        setAimPos(null);
        setActiveCardId(null);
        setGameState((prev) => ({ ...prev, selectedChipId: null }));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeChipId]);

  const handleCardDrop = useCallback((cardId: string) => {
    if (!activeChipId) return;

    const nameId = activeChipId;

    // Si la card ya está resuelta, ignorar y solo salir de aiming
    if (resolvedByCard[cardId]) {
      setActiveChipId(null);
      setAimPos(null);
      setActiveCardId(null);
      setGameState((prev) => ({ ...prev, selectedChipId: null }));
      return;
    }

    const chip = gameState.chips.find((c) => c.id === nameId);
    const chipName = chip?.name;
    const droppedCardId = cardId;

    const isCorrect = chipName ? CORRECT_MAPPING[chipName] === droppedCardId : false;

    // Actualizar conexiones
    setGameState((prev) => {
      const existingIndex = prev.connections.findIndex(
        (c) => c.nameId === nameId
      );
      const newConnections = [...prev.connections];
      if (existingIndex >= 0) {
        newConnections[existingIndex] = { nameId, cardId: droppedCardId };
      } else {
        newConnections.push({ nameId, cardId: droppedCardId });
      }

      return {
        ...prev,
        connections: newConnections,
      };
    });

    if (isCorrect) {
      playSfx("correct");
      if (chipName) {
        const willBeComplete =
          Object.keys(resolvedByCard).length + 1 === gameState.cards.length;

        setResolvedByCard((prev) => ({
          ...prev,
          [droppedCardId]: chipName,
        }));

        setGameState((prev) => ({
          ...prev,
          chips: prev.chips.filter((c) => c.id !== nameId),
        }));

        setCardFeedback((prev) => ({
          ...prev,
          [droppedCardId]: "correct",
        }));

        if (willBeComplete) {
          playSfx("complete");
        }

        const existingTimer = correctFeedbackTimersRef.current[droppedCardId];
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
          setCardFeedback((prev) => ({
            ...prev,
            [droppedCardId]: "idle",
          }));
          correctFeedbackTimersRef.current[droppedCardId] = null;
        }, CORRECT_FEEDBACK_DELAY);

        correctFeedbackTimersRef.current[droppedCardId] = timer;
      }
    } else {
      playSfx("incorrect");
      setCardStatus((prev) => ({
        ...prev,
        [droppedCardId]: "incorrect",
      }));

      setCardFeedback((prev) => ({
        ...prev,
        [droppedCardId]: "incorrect",
      }));

      const existingTimer = resetTimersRef.current[droppedCardId];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        setCardStatus((prev) => ({
          ...prev,
          [droppedCardId]: "idle",
        }));
        setCardFeedback((prev) => ({
          ...prev,
          [droppedCardId]: "idle",
        }));
        resetTimersRef.current[droppedCardId] = null;
      }, INCORRECT_RESET_DELAY);

      resetTimersRef.current[droppedCardId] = timer;
    }

    // Reset highlight/aiming
    setActiveChipId(null);
    setAimPos(null);
    setActiveCardId(null);
    setGameState((prev) => ({ ...prev, selectedChipId: null }));
  }, [activeChipId, gameState.cards.length, gameState.chips, playSfx, resolvedByCard]);

  const handleRevealAnswers = () => {
    setMode("reveal");
  };

  const handleRestart = () => {
    // Resetear todos los estados del juego
    setResolvedByCard({});
    setCardFeedback({});
    setCardStatus({});
    setActiveCardId(null);
    setActiveChipId(null);
    setAimPos(null);
    
    // Limpiar todos los timers
    Object.values(resetTimersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    Object.values(correctFeedbackTimersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    resetTimersRef.current = {};
    correctFeedbackTimersRef.current = {};

    // Restaurar chips disponibles
    setGameState((prev) => ({
      ...prev,
      chips: mockChips,
      connections: [],
      draggingNameId: null,
      hoveredNameId: null,
    }));

    // Volver a modo play y resetear timer
    setElapsedSeconds(0);
    setMode("play");
  };

  const handleCloseGame = () => {
    // Volver a modo play sin resetear
    setMode("play");
  };

  if (gameState.showSuccess) {
    return (
      <SuccessScreen
        connections={gameState.connections}
        cards={gameState.cards}
        chips={gameState.chips}
      />
    );
  }

  // Juego completo cuando ya no quedan chips disponibles (todas las uniones correctas)
  const isGameComplete = gameState.chips.length === 0;

  // Timer real: actualiza cada segundo en play mode, pausa cuando isPaused
  useEffect(() => {
    if (mode !== "play" || isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isPaused]);

  // En reveal mode, crear resolvedByCard automático usando CORRECT_MAPPING
  const revealResolvedByCard = mode === "reveal" 
    ? Object.entries(CORRECT_MAPPING).reduce((acc, [chipName, cardId]) => {
        acc[cardId] = chipName;
        return acc;
      }, {} as Record<string, string>)
    : resolvedByCard;

  // Cerrar pausa con tecla Escape
  useEffect(() => {
    if (!isPaused) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPaused(false);
        setGameState((prev) => ({
          ...prev,
          isPaused: false,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaused]);

  const connectedCount = Object.keys(resolvedByCard).length;
  const totalCards = gameState.cards.length;

  // Origen de la flecha (chip seleccionado)
  let arrowOrigin: { x: number; y: number } | null = null;
  if (activeChipId) {
    const chipEl = chipRefs.current.get(activeChipId);
    if (chipEl) {
      const r = chipEl.getBoundingClientRect();
      arrowOrigin = {
        x: r.left + r.width / 2,
        y: r.top,
      };
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {!skipBackground && <Background />}

      {/* Capa “respiración” muy sutil (solo play; reduced-motion la desactiva en CSS) */}
      {mode === "play" && (
        <div
          className="game-breathe absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, #fff 0%, transparent 70%)",
          }}
          aria-hidden
        />
      )}

      {/* Contenedor del juego: se bloquea mientras está en pausa o en reveal mode */}
      <div style={isPaused || mode === "reveal" ? { pointerEvents: "none" } : undefined}>
        <div className="relative z-10 min-h-screen">
          <TopHUD
            lives={gameState.lives}
            elapsedSeconds={elapsedSeconds}
            isMuted={gameState.isMuted}
            mode={mode}
            onPauseClick={handleTogglePause}
            onMuteToggle={handleMuteToggle}
          />

          <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
            {mode === "reveal" ? (
              <p
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Right Answers are ...
              </p>
            ) : (
              <div className="game-title-enter">
                <GameInstruction />
              </div>
            )}
            {showCardsAndChips && (
              <>
                {/* Cards sin overflow-hidden: slot y hover pueden salir del borde */}
                <div ref={canvasRef} style={{ marginTop: "58px" }}>
                  <CardStage
                    cards={gameState.cards}
                    highlightedCardId={mode === "reveal" ? null : activeCardId}
                    cardStatus={cardStatus}
                    resolvedByCard={revealResolvedByCard}
                    cardFeedback={cardFeedback}
                    onCardHover={() => {}}
                    onCardDrop={handleCardDrop}
                    connectSlotRef={registerConnectSlot}
                    animateMount={mode === "play"}
                  />
                </div>

                {/* Ocultar ChipRow en reveal mode */}
                {mode !== "reveal" && (
                  <div style={{ marginTop: "78px" }}>
                    <ChipRow
                      chips={gameState.chips}
                      hoveredNameId={gameState.hoveredNameId}
                      draggingNameId={null}
                      selectedChipId={gameState.selectedChipId}
                      onChipHover={handleChipHover}
                      onChipClick={handleChipClick}
                      chipRef={registerChipRef}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Botones del bottom según el modo */}
        {mode === "reveal" ? (
          /* En reveal mode: Close game (izq) + Restart (der) - fuera del bloqueo de pointer-events */
          <div
            className="absolute left-1/2 flex items-center gap-4"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
              zIndex: 20,
            }}
          >
            {/* Botón secundario: Close game (izquierda) */}
            <button
              type="button"
              onClick={handleCloseGame}
              className="rounded-[32px]"
              style={{
                width: "320px",
                height: "68px",
                fontFamily: "var(--font-bitter), serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#FFFFFF",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "12px 32px",
                borderTop: "2px solid rgba(255, 255, 255, 0.20)",
                borderRight: "2px solid rgba(255, 255, 255, 0.20)",
                borderLeft: "2px solid rgba(255, 255, 255, 0.20)",
                borderBottom: "none",
                background:
                  "linear-gradient(0deg, rgba(255, 255, 255, 0.00) 24.06%, rgba(255, 255, 255, 0.10) 100%)",
                backgroundBlendMode: "screen",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              Close game
            </button>

            {/* Botón primario: Restart (derecha) */}
            <GamePrimaryButton onClick={handleRestart}>
              Restart
            </GamePrimaryButton>
          </div>
        ) : (
          /* En play mode: Reveal / Continue */
          <div
            className="absolute left-1/2"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
              zIndex: 20,
            }}
          >
            {!isGameComplete && (
              <RevealAnswersButton onClick={handleRevealAnswers} />
            )}
            {isGameComplete && (
              <GamePrimaryButton onClick={() => console.log("continue")}>
                Continue
              </GamePrimaryButton>
            )}
          </div>
        )}

        {/* Flecha en modo aiming: chip seleccionado + cursor */}
        {mode === "play" && activeChipId && aimPos && arrowOrigin && (
          <DragArrowOverlay
            originX={arrowOrigin.x}
            originY={arrowOrigin.y}
            tipX={aimPos.x}
            tipY={aimPos.y}
          />
        )}
      </div>

      {/* Menú de pausa (overlay con blur + modal) */}
      {isPaused && (
        <PauseMenu onResume={handleTogglePause} onQuit={() => {}} />
      )}
    </div>
  );
}
