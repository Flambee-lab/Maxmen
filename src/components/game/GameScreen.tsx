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
  /** Estado global de mute proveniente de GamePage (opcional) */
  isMuted?: boolean;
  /** Toggle global de mute (opcional); si no se pasa, usa estado interno */
  onMuteToggle?: () => void;
  /** Al pulsar Continue en pantalla final (success o time's up); si no se pasa, se usa handleRestart */
  onContinueFromEndgame?: () => void;
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

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075; // música ambiental baja
const SFX_VOLUME = 0.55; // SFX claramente por encima de la música
/** Duración en ms del overlay correcto/incorrecto sobre la card antes de volver a idle */
const FEEDBACK_OVERLAY_MS = 800;

/** Por debajo de estos segundos restantes el reloj se pone rojo y suena la alerta */
const LOW_TIME_THRESHOLD = 20;
/** Countdown inicial: siempre 2:00. El warning (rojo, animación, tick) solo se activa cuando quedan ≤20s. */
const INITIAL_COUNTDOWN_SECONDS = 120;

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

/** Beep corto de countdown (≤20s): más fuerte que el lofi, para tick cada segundo */
function playTickSfx(
  audioContextRef: React.MutableRefObject<AudioContext | null>
) {
  getAudioContext(audioContextRef).then((ctx) => {
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 520;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  });
}

export function GameScreen({
  skipBackground = false,
  isMuted,
  onMuteToggle,
  onContinueFromEndgame,
}: GameScreenProps = {}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardStatus, setCardStatus] = useState<Record<string, "correct" | "incorrect" | "idle">>({});
  const [resolvedByCard, setResolvedByCard] = useState<Record<string, string>>({}); // cardId -> chipName
  const [cardFeedback, setCardFeedback] = useState<Record<string, "idle" | "incorrect" | "correct">>({}); // cardId -> feedback temporal
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>("play");
  const connectSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackBgStopRef = useRef<(() => void) | null>(null);
  const fallbackGainRef = useRef<GainNode | null>(null);
  const useFallbackRef = useRef(false);
  const sfxRefs = useRef<Record<string, HTMLAudioElement>>({});
  const mutedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lowTimeAlertPlayedRef = useRef(false);
  const feedbackResetTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const feedbackCorrectTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

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
      successReason: undefined,
    };
  });

  const [remainingSeconds, setRemainingSeconds] = useState(INITIAL_COUNTDOWN_SECONDS); // Countdown → 0:00
  const [showCardsAndChips, setShowCardsAndChips] = useState(false);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [activeOriginCardId, setActiveOriginCardId] = useState<string | null>(null);
  const [aimPos, setAimPos] = useState<{ x: number; y: number } | null>(null);

  const effectiveIsMuted = typeof isMuted === "boolean" ? isMuted : gameState.isMuted;

  useEffect(() => {
    mutedRef.current = effectiveIsMuted;
  }, [effectiveIsMuted]);

  // Si viene isMuted desde fuera, sincronizar el gameState interno
  useEffect(() => {
    if (typeof isMuted === "boolean") {
      setGameState((prev) => ({ ...prev, isMuted }));
    }
  }, [isMuted]);

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
    if (onMuteToggle) {
      onMuteToggle();
    } else {
      setGameState((prev) => ({
        ...prev,
        isMuted: !prev.isMuted,
      }));
    }
  };

  const handleChipHover = useCallback((nameId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      hoveredNameId: nameId,
    }));
  }, []);

  const handleChipClick = useCallback(
    (chipId: string) => {
      // Si estamos en modo card → chip, este click intenta completar conexión usando la card activa
      if (activeOriginCardId) {
        const cardId = activeOriginCardId;
        resolveConnection(chipId, cardId);
        setActiveOriginCardId(null);
        return;
      }

      // Modo normal: chip → card
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

      // Activar modo chip → card y desactivar modo card → chip
      setActiveOriginCardId(null);
      setActiveChipId(chipId);
      setAimPos(null);
      setActiveCardId(null);
      playSfx("drag");
    },
    [activeChipId, activeOriginCardId, playSfx]
  );

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

  // Mousemove global mientras hay origen activo (chip → card o card → chip): actualizar endpoint de la flecha (aimPos)
  useEffect(() => {
    const hasChipOrigin = !!activeChipId;
    const hasCardOrigin = !!activeOriginCardId;
    if (!hasChipOrigin && !hasCardOrigin) {
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

      // Área válida: en modo card → chip incluir también el bloque de chips (hasta los botones)
      if (hasCardOrigin && chipsContainerRef.current) {
        const chipsRect = chipsContainerRef.current.getBoundingClientRect();
        const top = Math.min(rect.top, chipsRect.top);
        const bottom = Math.max(rect.bottom, chipsRect.bottom);
        const left = Math.min(rect.left, chipsRect.left);
        const right = Math.max(rect.right, chipsRect.right);
        x = Math.max(left, Math.min(x, right));
        y = Math.max(top, Math.min(y, bottom));
      } else {
        // Modo chip → card: clamp al rect del canvas
        x = Math.max(rect.left, Math.min(x, rect.right));
        y = Math.max(rect.top, Math.min(y, rect.bottom));
      }

      let endX = x;
      let endY = y;
      let hoveredCard: string | null = null;

      const el = document.elementFromPoint(e.clientX, e.clientY);

      if (hasChipOrigin) {
        // Modo chip → card: snap a connect slot/card
        const slot = el?.closest('[data-connect-slot="true"]') as HTMLElement | null;
        if (slot) {
          const r = slot.getBoundingClientRect();
          endX = r.left + r.width / 2;
          endY = r.top + r.height / 2;
          const slotCardId = slot.getAttribute("data-card-id");
          if (slotCardId && slotCardId.startsWith("card-") && !resolvedByCard[slotCardId]) {
            hoveredCard = slotCardId;
          }
        } else if (el) {
          const cardEl = el.closest('[data-card-id]') as HTMLElement | null;
          const cardId = cardEl?.getAttribute("data-card-id") ?? null;
          if (cardId && cardId.startsWith("card-") && !resolvedByCard[cardId]) {
            hoveredCard = cardId;
          }
        }

        setActiveCardId(hoveredCard);
      }

      // Guardamos en coords de viewport (las usa directamente el SVG)
      setAimPos({ x: endX, y: endY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeChipId, activeOriginCardId, resolvedByCard]);

  // ESC cancela aiming de chip
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

  // ESC cancela aiming de card
  useEffect(() => {
    if (!activeOriginCardId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveOriginCardId(null);
        setAimPos(null);
        setActiveCardId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeOriginCardId]);

  const resolveConnection = useCallback(
    (nameId: string, cardId: string) => {
      // Si la card ya está resuelta, ignorar y solo salir de aiming
      if (resolvedByCard[cardId]) {
        setActiveChipId(null);
        setActiveOriginCardId(null);
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
            ...(willBeComplete ? { showSuccess: true, successReason: "victory" as const } : {}),
          }));

          setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "correct" }));

          const existing = feedbackCorrectTimersRef.current[droppedCardId];
          if (existing) clearTimeout(existing);
          feedbackCorrectTimersRef.current[droppedCardId] = setTimeout(() => {
            setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "idle" }));
            feedbackCorrectTimersRef.current[droppedCardId] = null;
          }, FEEDBACK_OVERLAY_MS);

          if (willBeComplete) {
            playSfx("complete");
          }
        }
      } else {
        playSfx("incorrect");
        setCardStatus((prev) => ({ ...prev, [droppedCardId]: "incorrect" }));
        setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "incorrect" }));

        const existing = feedbackResetTimersRef.current[droppedCardId];
        if (existing) clearTimeout(existing);
        feedbackResetTimersRef.current[droppedCardId] = setTimeout(() => {
          setCardStatus((prev) => ({ ...prev, [droppedCardId]: "idle" }));
          setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "idle" }));
          feedbackResetTimersRef.current[droppedCardId] = null;
        }, FEEDBACK_OVERLAY_MS);
      }

      // Reset highlight/aiming
      setActiveChipId(null);
      setActiveOriginCardId(null);
      setAimPos(null);
      setActiveCardId(null);
      setGameState((prev) => ({ ...prev, selectedChipId: null }));
    },
    [gameState.cards.length, gameState.chips, playSfx, resolvedByCard]
  );

  const handleCardDrop = useCallback(
    (cardId: string) => {
      if (activeChipId) {
        // Modo chip → card: completar conexión
        resolveConnection(activeChipId, cardId);
        return;
      }

      // Modo card → chip: click en card para activar / desactivar origen
      if (resolvedByCard[cardId]) {
        return;
      }

      if (activeOriginCardId === cardId) {
        // Toggle off
        setActiveOriginCardId(null);
        setAimPos(null);
        setActiveCardId(null);
        return;
      }

      // Activar origen en esta card y desactivar cualquier chip
      setActiveChipId(null);
      setActiveOriginCardId(cardId);
      setAimPos(null);
      setActiveCardId(null);
      setGameState((prev) => ({ ...prev, selectedChipId: null }));
      playSfx("drag");
    },
    [activeChipId, activeOriginCardId, playSfx, resolveConnection, resolvedByCard]
  );

  const handleRevealAnswers = () => {
    setMode("reveal");
  };

  const handleRestart = () => {
    // Limpiar timers de feedback overlay
    Object.values(feedbackResetTimersRef.current).forEach((t) => {
      if (t) clearTimeout(t);
    });
    Object.values(feedbackCorrectTimersRef.current).forEach((t) => {
      if (t) clearTimeout(t);
    });
    feedbackResetTimersRef.current = {};
    feedbackCorrectTimersRef.current = {};

    setResolvedByCard({});
    setCardFeedback({});
    setCardStatus({});
    setActiveCardId(null);
    setActiveChipId(null);
    setAimPos(null);

    // Volver a modo play y resetear timer countdown
    setRemainingSeconds(INITIAL_COUNTDOWN_SECONDS);
    setMode("play");
    setGameState((prev) => ({
      ...prev,
      chips: mockChips,
      connections: [],
      draggingNameId: null,
      hoveredNameId: null,
      showSuccess: false,
      successReason: undefined,
    }));
  };

  const handleCloseGame = () => {
    // Volver a modo play sin resetear
    setMode("play");
  };

  // Juego completo cuando ya no quedan chips disponibles (todas las uniones correctas)
  const isGameComplete = gameState.chips.length === 0;

  // Timer countdown: 2:00 → 0:00, cada segundo en play mode (se detiene en pausa o en pantalla final)
  useEffect(() => {
    if (mode !== "play" || isPaused || gameState.showSuccess) return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, isPaused, gameState.showSuccess]);

  // Al llegar a 0:00 → pantalla final por tiempo agotado (sin tocar victoria por conexión)
  useEffect(() => {
    if (mode !== "play" || isPaused) return;
    if (remainingSeconds === 0) {
      setGameState((prev) => ({ ...prev, showSuccess: true, successReason: "timeUp" }));
    }
  }, [mode, isPaused, remainingSeconds]);

  // Al cruzar a ≤20s: tick de countdown cada segundo hasta 0; para si termina el juego o llega a 0
  useEffect(() => {
    const inLowTime =
      mode === "play" &&
      !isPaused &&
      !gameState.showSuccess &&
      remainingSeconds <= LOW_TIME_THRESHOLD &&
      remainingSeconds > 0;
    const muted = typeof isMuted === "boolean" ? isMuted : gameState.isMuted;

    if (!inLowTime) {
      lowTimeAlertPlayedRef.current = false;
      return;
    }

    if (muted) return;

    // Un tick por cada segundo que estamos en low-time (el effect corre cada vez que remainingSeconds baja)
    playTickSfx(audioContextRef);
    lowTimeAlertPlayedRef.current = true;
  }, [mode, isPaused, remainingSeconds, gameState.showSuccess, gameState.isMuted, isMuted]);

  // En reveal mode, crear resolvedByCard automático usando CORRECT_MAPPING
  const revealResolvedByCard = mode === "reveal"
    ? Object.entries(CORRECT_MAPPING).reduce((acc, [chipName, cardId]) => {
        acc[cardId] = chipName;
        return acc;
      }, {} as Record<string, string>)
    : resolvedByCard;

  // Endgame por tiempo: misma UI que el juego; contenido dinámico según progreso real (solo uniones pendientes)
  const isTimeUpEndgame = !!(
    gameState.showSuccess && gameState.successReason === "timeUp"
  );
  const timeUpRemainingCards = gameState.cards.filter(
    (c) => !resolvedByCard[c.id]
  );
  const timeUpResolvedByCard = (() => {
    const acc: Record<string, string> = {};
    const remainingIds = new Set(timeUpRemainingCards.map((c) => c.id));
    for (const [chipName, cardId] of Object.entries(CORRECT_MAPPING)) {
      if (remainingIds.has(cardId)) acc[cardId] = chipName;
    }
    return acc;
  })();
  const cardsForDisplay = isTimeUpEndgame
    ? timeUpRemainingCards
    : gameState.cards;

  // Pantalla final por éxito (todas correctas): mismo layout que time's up; todas las cards con nombres correctos
  const isSuccessEndgame = !!(
    gameState.showSuccess && gameState.successReason === "victory"
  );
  const successResolvedByCard = Object.entries(CORRECT_MAPPING).reduce(
    (acc, [chipName, cardId]) => {
      acc[cardId] = chipName;
      return acc;
    },
    {} as Record<string, string>
  );
  const resolvedByCardForDisplay = isTimeUpEndgame
    ? timeUpResolvedByCard
    : isSuccessEndgame
      ? successResolvedByCard
      : mode === "reveal"
        ? revealResolvedByCard
        : resolvedByCard;
  const isFinalScreen = isTimeUpEndgame || isSuccessEndgame;

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

  // Cleanup: cancelar timers de feedback overlay al desmontar
  useEffect(() => {
    return () => {
      Object.values(feedbackResetTimersRef.current).forEach((t) => {
        if (t) clearTimeout(t);
      });
      Object.values(feedbackCorrectTimersRef.current).forEach((t) => {
        if (t) clearTimeout(t);
      });
      feedbackResetTimersRef.current = {};
      feedbackCorrectTimersRef.current = {};
    };
  }, []);

  const connectedCount = Object.keys(resolvedByCard).length;
  const totalCards = gameState.cards.length;

  // Origen de la flecha (chip seleccionado o card seleccionada)
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
  } else if (activeOriginCardId) {
    const slotEl = connectSlotsRef.current.get(activeOriginCardId);
    if (slotEl) {
      const r = slotEl.getBoundingClientRect();
      arrowOrigin = {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      };
    }
  }

  // Pantallas finales (éxito y time's up) usan el mismo layout en GameScreen; ya no se usa SuccessScreen.
  // (SuccessScreen queda por si se reutiliza en otra ruta.)
  return (
    <div className="relative min-h-screen overflow-hidden">
      {!skipBackground && <Background />}

      {/* Capa “respiración” muy sutil (solo play; reduced-motion la desactiva en CSS) */}
      {mode === "play" && !isFinalScreen && (
        <div
          className="game-breathe absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, #fff 0%, transparent 70%)",
          }}
          aria-hidden
        />
      )}

      {/* Contenedor del juego: se bloquea en pausa, reveal o pantallas finales (success / time's up) */}
      <div style={isPaused || mode === "reveal" || isFinalScreen ? { pointerEvents: "none" } : undefined}>
        <div className="relative z-10 min-h-screen">
          <TopHUD
            lives={gameState.lives}
            elapsedSeconds={remainingSeconds}
            isMuted={effectiveIsMuted}
            mode={mode}
            lowTimeThreshold={LOW_TIME_THRESHOLD}
            onPauseClick={handleTogglePause}
            onMuteToggle={handleMuteToggle}
          />

          <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
            {isTimeUpEndgame ? (
              <p
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Endgame – Time&apos;s Up
              </p>
            ) : isSuccessEndgame ? (
              <p
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                You completed the game!
              </p>
            ) : mode === "reveal" ? (
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
                    cards={cardsForDisplay}
                    highlightedCardId={mode === "reveal" || isFinalScreen ? null : activeCardId}
                    cardStatus={cardStatus}
                    resolvedByCard={resolvedByCardForDisplay}
                    cardFeedback={cardFeedback}
                    onCardHover={() => {}}
                    onCardDrop={handleCardDrop}
                    connectSlotRef={registerConnectSlot}
                    animateMount={mode === "play"}
                    showSlotArrow={!activeChipId}
                    activeOriginCardId={activeOriginCardId}
                  />
                </div>

                {/* Ocultar ChipRow en reveal y en pantallas finales (success / time's up) */}
                {mode !== "reveal" && !isFinalScreen && (
                  <div ref={chipsContainerRef} style={{ marginTop: "120px" }}>
                    <ChipRow
                      chips={gameState.chips}
                      hoveredNameId={gameState.hoveredNameId}
                      draggingNameId={null}
                      selectedChipId={gameState.selectedChipId}
                      onChipHover={handleChipHover}
                      onChipClick={handleChipClick}
                      chipRef={registerChipRef}
                      hideChipArrows={!!activeOriginCardId}
                      activeChipId={activeChipId}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Botones del bottom: pantallas finales = solo Continue con +32px padding bottom */}
        {isFinalScreen ? (
          <div
            className="absolute left-1/2"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
              zIndex: 20,
              paddingBottom: "32px",
            }}
          >
            <GamePrimaryButton onClick={onContinueFromEndgame ?? handleRestart}>
              Continue
            </GamePrimaryButton>
          </div>
        ) : mode === "reveal" ? (
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
        {mode === "play" && (activeChipId || activeOriginCardId) && aimPos && arrowOrigin && (
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
