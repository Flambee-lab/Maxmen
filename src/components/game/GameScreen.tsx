"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { GameState, type GameDifficulty, type PhotoCard } from "@/types/game";
import type { GameLibraryDeck } from "@/types/gameLibraryDeck";
import type { GameEndgameSnapshot } from "@/types/gameEndgameSnapshot";
import { mockCards, mockChips } from "@/mocks/gameMocks";
import {
  DEFAULT_SECONDS_PER_ROUND,
  LOW_TIME_SECONDS_THRESHOLD,
} from "@/lib/gameRoundConfig";
import { Background } from "./Background";
import { TopHUD } from "./TopHUD";
import { GameInstruction } from "./GameInstruction";
import { CardStage } from "./CardStage";
import { ChipRow } from "./ChipRow";
import { PauseMenu } from "./PauseMenu";
import { DragArrowOverlay } from "./DragArrowOverlay";
import { GamePrimaryButton } from "./GamePrimaryButton";
import { VictoryConfetti } from "./VictoryConfetti";
import Image from "next/image";

interface DragState {
  nameId: string;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
}

type GameMode = "play" | "reveal";
type InternalRound = 1 | 2 | 3;

function getLibraryCardsForRound(deck: GameLibraryDeck, round: InternalRound): PhotoCard[] {
  const per = deck.cardsPerRound;
  if (per && per.length >= round) {
    return per[round - 1] ?? deck.cards;
  }
  return deck.cards;
}

interface GameScreenProps {
  /** Si true, no renderiza Background (lo provee GameContainer) */
  skipBackground?: boolean;
  /** Estado global de mute proveniente de GamePage (opcional) */
  isMuted?: boolean;
  /** Toggle global de mute (opcional); si no se pasa, usa estado interno */
  onMuteToggle?: () => void;
  /** Continue tras “Good job!” o time-up final → pantalla de resultados con snapshot del juego */
  onContinueFromEndgame?: (snapshot: GameEndgameSnapshot) => void;
  /** Segundos por ronda, configurables desde Intro */
  initialRoundSeconds?: number;
  /** Dificultad configurada desde Intro (por ahora no cambia el gameplay) */
  difficulty?: GameDifficulty;
  /** Mazo desde la biblioteca (Quick Play); sin esto se usan los mocks internos */
  libraryDeck?: GameLibraryDeck | null;
}

/** Mapping correcto Round 1/3: chipName -> cardId */
const CORRECT_MAPPING_ROUND_NAMES: Record<string, string> = {
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

/** Mapping correcto Round 2 (relationships): chipLabel -> cardId */
const CORRECT_MAPPING_ROUND_RELATIONSHIPS: Record<string, string> = {
  Nephew: "card-2", // Jan (blond kid, second from left)
  Son: "card-1", // Tom (far left)
  "Sister-in-law": "card-3", // Catherine (second from right)
  Godson: "card-4", // Justin (far right)
};

/** Mapping correcto Round 3 (birth dates): chipLabel -> cardId */
const CORRECT_MAPPING_ROUND_BIRTHDAYS: Record<string, string> = {
  "Mar 12, 1985": "card-1", // Tom (far left)
  "Jul 28, 2015": "card-2", // Ian (second from the left)
  "Nov 3, 2005": "card-4", // Justin (far right)
  "Jan 19, 1962": "card-3", // Catherine (second from the right)
};

const RELATIONSHIP_BY_CARD_ROUND_2_FINAL: Record<string, string> = {
  "card-1": "Son",
  "card-2": "Nephew",
  "card-3": "Sister-in-law",
  "card-4": "Godson",
};

const BIRTHDATE_BY_CARD_ROUND_3_FINAL: Record<string, string> = {
  "card-1": "Mar 12, 1985",
  "card-2": "Jul 28, 2015",
  "card-3": "Jan 19, 1962",
  "card-4": "Nov 3, 2005",
};

/** chipLabel → cardId → invertir a cardId → chipLabel para resolvedByCard */
function chipToCardMappingToResolved(
  mapping: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(mapping).map(([chipName, cardId]) => [cardId, chipName])
  );
}

/** Si no hubo estado de apilado, reconstruye líneas desde nombre + relación + cumple (p. ej. recap). */
function buildStackedLinesFallback(
  cards: { id: string }[],
  resolved: Record<string, string>,
  rel: Record<string, string>,
  birth: Record<string, string>
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const { id } of cards) {
    const lines: string[] = [];
    if (resolved[id]) lines.push(resolved[id]);
    if (rel[id]) lines.push(`is my ${rel[id]}`);
    if (birth[id]) lines.push(birth[id]);
    if (lines.length) out[id] = lines;
  }
  return out;
}

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075; // música ambiental baja
const SFX_VOLUME = 0.55; // SFX claramente por encima de la música
/** Duración en ms del overlay correcto/incorrecto sobre la card antes de volver a idle */
const FEEDBACK_OVERLAY_MS = 800;
/** Cuánto se muestra la pantalla "time's up" antes de pasar a la siguiente ronda o al video final */
const TIME_UP_DISPLAY_MS = 6000;
/** Tras “Good job!” pasa solo a la pantalla de resultados (sin botón Continue). */
const VICTORY_GOOD_JOB_AUTO_MS = 3200;
/**
 * Secuencia intro / transición entre rondas (más legible):
 * 1) Solo "Round N" → 2) categoría → 3) pausa
 * → 4) cartas (animación en CSS) → playing (sin repetir "Round" arriba)
 */
type RoundIntroStep = "roundNum" | "category" | "cards";

const ROUND_INTRO_MS_ROUND_NUM = 2000;
const ROUND_INTRO_MS_CATEGORY = 2000;
const ROUND_INTRO_MS_BREAK = 400;
/** Tiempo desde que aparecen las cartas hasta pasar a playing */
const ROUND_INTRO_MS_CARD_FLIP = 4000;

const ROUND_INTRO_MS_UNTIL_CARDS =
  ROUND_INTRO_MS_ROUND_NUM + ROUND_INTRO_MS_CATEGORY + ROUND_INTRO_MS_BREAK;
/** Fin de intro / transición (no hay segundo banner "Round X of 3") */
const ROUND_INTRO_MS_TO_PLAYING =
  ROUND_INTRO_MS_UNTIL_CARDS + ROUND_INTRO_MS_CARD_FLIP;

function getRoundIntroCopy(
  phase: "preRoundIntro" | "transition",
  currentRound: InternalRound,
  categoryLabels?: string[]
): { displayRound: 1 | 2 | 3; category: string } {
  const L = categoryLabels ?? [];
  if (phase === "preRoundIntro" && currentRound === 1) {
    return { displayRound: 1, category: L[0] ?? "Name" };
  }
  if (phase === "transition" && currentRound === 1) {
    return { displayRound: 2, category: L[1] ?? "Relationships" };
  }
  if (phase === "transition" && currentRound === 2) {
    return { displayRound: 3, category: L[2] ?? "Birthday" };
  }
  return { displayRound: currentRound, category: "" };
}

const LOW_TIME_THRESHOLD = LOW_TIME_SECONDS_THRESHOLD;
const DEFAULT_INITIAL_ROUND_SECONDS = DEFAULT_SECONDS_PER_ROUND;

/**
 * Estructura preparada para rondas internas.
 * Por ahora, round 2 y 3 usan la misma base de datos que round 1 (placeholder).
 */
function getRoundData(round: InternalRound) {
  switch (round) {
    case 1:
      return { cards: mockCards, chips: mockChips };
    case 2:
      // Round 2: chips de relaciones (cards mantienen el mismo orden/layout).
      return {
        cards: mockCards,
        chips: [
          {
            id: "chip-r2-1",
            name: "Nephew",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-2",
          },
          {
            id: "chip-r2-2",
            name: "Son",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-1",
          },
          {
            id: "chip-r2-3",
            name: "Sister-in-law",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-3",
          },
          {
            id: "chip-r2-4",
            name: "Godson",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-4",
          },
          {
            id: "chip-distractor-r2",
            name: "Boyfriend",
            isSelected: false,
            isMatched: false,
            correctCardId: "__distractor__",
            isDistractor: true,
          },
        ],
      };
    case 3:
      // Round 3: chips representan fechas de nacimiento.
      // Las cards mantienen name + relationship visuales de Round 2.
      return {
        cards: mockCards,
        chips: [
          {
            id: "chip-r3-1",
            name: "Mar 12, 1985",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-1",
          },
          {
            id: "chip-r3-2",
            name: "Jul 28, 2015",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-2",
          },
          {
            id: "chip-r3-3",
            name: "Nov 3, 2005",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-4",
          },
          {
            id: "chip-r3-4",
            name: "Jan 19, 1962",
            isSelected: false,
            isMatched: false,
            correctCardId: "card-3",
          },
          {
            id: "chip-distractor-r3",
            name: "Jan 15, 1960",
            isSelected: false,
            isMatched: false,
            correctCardId: "__distractor__",
            isDistractor: true,
          },
        ],
      };
    default:
      return { cards: mockCards, chips: mockChips };
  }
}

/** Crea o reanuda el AudioContext en el primer gesto del usuario */
async function getAudioContext(audioContextRef: React.MutableRefObject<AudioContext | null>): Promise<AudioContext | null> {
  if (typeof window === "undefined") return null;
  try {
    let ctx = audioContextRef.current;
    if (!ctx) {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
    }
    if (ctx.state === "suspended") {
      await ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
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
  getAudioContext(audioContextRef)
    .then((ctx) => {
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
    })
    .catch(() => {});
}

/** Beep corto de countdown (últimos segundos de ronda): más fuerte que el lofi, tick cada segundo */
function playTickSfx(
  audioContextRef: React.MutableRefObject<AudioContext | null>
) {
  getAudioContext(audioContextRef)
    .then((ctx) => {
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
    })
    .catch(() => {});
}

export function GameScreen({
  skipBackground = false,
  isMuted,
  onMuteToggle,
  onContinueFromEndgame,
  initialRoundSeconds,
  libraryDeck,
}: GameScreenProps = {}) {
  const initialSeconds = (() => {
    const raw = initialRoundSeconds;
    const n =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
    return DEFAULT_INITIAL_ROUND_SECONDS;
  })();

  const maxRounds = Math.min(
    3,
    Math.max(1, libraryDeck?.totalRounds ?? 3)
  );

  const [round, setRound] = useState<InternalRound>(1);
  const [gamePhase, setGamePhase] = useState<"preRoundIntro" | "playing" | "transition">(
    "preRoundIntro"
  );
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardStatus, setCardStatus] = useState<Record<string, "correct" | "incorrect" | "idle">>({});
  const [resolvedByCard, setResolvedByCard] = useState<Record<string, string>>({}); // cardId -> chipName
  const [cardFeedback, setCardFeedback] = useState<Record<string, "idle" | "incorrect" | "correct">>({}); // cardId -> feedback temporal
  const [round2RelationshipByCard, setRound2RelationshipByCard] = useState<Record<string, string>>({});
  const [round3BirthDateByCard, setRound3BirthDateByCard] = useState<Record<string, string>>({});
  /** Nametag apilado por card (nombre → relación → fecha según rondas) */
  const [cardContentLinesByCard, setCardContentLinesByCard] = useState<
    Record<string, string[]>
  >({});
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
    const roundData = libraryDeck
      ? {
          cards: getLibraryCardsForRound(libraryDeck, 1),
          chips: libraryDeck.roundChips[0] ?? [],
        }
      : getRoundData(1);
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
      cards: roundData.cards,
      chips: roundData.chips,
      connections: [],
      showSuccess: false,
      successReason: undefined,
    };
  });

  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds); // Countdown → 0:00
  const [showCardsAndChips, setShowCardsAndChips] = useState(false);
  /** Pasos: número de ronda → categoría → cartas + giro → banner "Round N of 3" */
  const [roundIntroStep, setRoundIntroStep] = useState<RoundIntroStep>("roundNum");
  /** Entrada suave al tablero al salir de intro / transición entre rondas */
  const [playfieldAppear, setPlayfieldAppear] = useState(false);
  const prevGamePhaseRef = useRef(gamePhase);
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

  // Entrada “chill” del tablero: opacidad + leve slide al pasar a playing desde intro/transición
  useLayoutEffect(() => {
    const prev = prevGamePhaseRef.current;
    if (gamePhase === "transition" || gamePhase === "preRoundIntro") {
      setPlayfieldAppear(false);
    } else if (gamePhase === "playing" && (prev === "transition" || prev === "preRoundIntro")) {
      setPlayfieldAppear(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPlayfieldAppear(true);
        });
      });
    } else if (gamePhase === "playing") {
      setPlayfieldAppear(true);
    }
    prevGamePhaseRef.current = gamePhase;
  }, [gamePhase]);

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
    const playResult = sfx.play();
    const onFail = () => {
      playFallbackSfx(audioContextRef, type);
    };
    if (playResult !== undefined) {
      playResult.catch(onFail);
    } else {
      onFail();
    }
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

  const relationshipLabelPossessive =
    libraryDeck?.roundQuestionIds?.[1] === "relationships" || !libraryDeck;

  const resetRoundState = useCallback((targetRound: InternalRound) => {
    const roundData = libraryDeck
      ? {
          cards: getLibraryCardsForRound(libraryDeck, targetRound),
          chips: libraryDeck.roundChips[targetRound - 1] ?? [],
        }
      : getRoundData(targetRound);
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
    setRound2RelationshipByCard({});
    setRound3BirthDateByCard({});
    if (targetRound === 1) {
      setCardContentLinesByCard({});
    } else if (libraryDeck?.cardsPerRound?.length) {
      setCardContentLinesByCard({});
    }
    setCardStatus({});
    setActiveCardId(null);
    setActiveChipId(null);
    setActiveOriginCardId(null);
    setAimPos(null);
    setMode("play");
    if (targetRound === 1) {
      setShowCardsAndChips(false);
      setGamePhase("preRoundIntro");
    } else {
      setShowCardsAndChips(true);
      setGamePhase("playing");
    }
    setRound(targetRound);
    setRemainingSeconds(initialSeconds);

    setGameState((prev) => ({
      ...prev,
      round: targetRound,
      ...(targetRound === 1 ? { lives: 5 } : {}),
      cards: roundData.cards,
      chips: roundData.chips,
      connections: [],
      draggingNameId: null,
      hoveredNameId: null,
      selectedChipId: null,
      selectedCardId: null,
      showSuccess: false,
      successReason: undefined,
    }));
  }, [initialSeconds, libraryDeck]);

  const advanceToNextRound = useCallback(() => {
    if (round >= maxRounds) return;
    const nextRound = (round + 1) as InternalRound;
    resetRoundState(nextRound);
  }, [resetRoundState, round, maxRounds]);

  // Secuencia intro ronda 1 y transiciones 1→2 / 2→3 (textos escalonados + cartas al final)
  useEffect(() => {
    const isRound1Intro = gamePhase === "preRoundIntro" && round === 1;
    const isBetweenRounds =
      gamePhase === "transition" && round < maxRounds;
    if (!isRound1Intro && !isBetweenRounds) return;

    setRoundIntroStep("roundNum");
    setShowCardsAndChips(false);

    const tCategory = setTimeout(() => {
      setRoundIntroStep("category");
    }, ROUND_INTRO_MS_ROUND_NUM);

    const tCards = setTimeout(() => {
      setRoundIntroStep("cards");
      setShowCardsAndChips(true);
    }, ROUND_INTRO_MS_UNTIL_CARDS);

    const tDone = setTimeout(() => {
      if (isRound1Intro) {
        setGamePhase("playing");
      } else {
        advanceToNextRound();
      }
    }, ROUND_INTRO_MS_TO_PLAYING);

    return () => {
      clearTimeout(tCategory);
      clearTimeout(tCards);
      clearTimeout(tDone);
    };
  }, [advanceToNextRound, gamePhase, maxRounds, round]);

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

      const deckMap = libraryDeck?.mappingsPerRound[round - 1];
      const correctMappingByRound =
        deckMap ??
        (round === 2
          ? CORRECT_MAPPING_ROUND_RELATIONSHIPS
          : round === 3
            ? CORRECT_MAPPING_ROUND_BIRTHDAYS
            : CORRECT_MAPPING_ROUND_NAMES);
      const isDistractor = chip?.isDistractor === true;
      const isCorrect =
        !isDistractor &&
        !!chipName &&
        correctMappingByRound[chipName] === droppedCardId;

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
          const realChipsBefore = gameState.chips.filter((c) => !c.isDistractor).length;
          const willBeComplete =
            realChipsBefore === 1 &&
            Object.keys(resolvedByCard).length + 1 === gameState.cards.length;

          setResolvedByCard((prev) => ({
            ...prev,
            [droppedCardId]: chipName,
          }));

          setCardContentLinesByCard((prev) => {
            const prevLines = prev[droppedCardId] ?? [];
            const line =
              round === 2 &&
              (libraryDeck?.roundQuestionIds?.[1] === "relationships" ||
                (!libraryDeck && round === 2))
                ? `is my ${chipName}`
                : chipName;
            return {
              ...prev,
              [droppedCardId]: [...prevLines, line],
            };
          });

          if (round === 2) {
            setRound2RelationshipByCard((prev) => ({
              ...prev,
              [droppedCardId]: chipName,
            }));
          }
          if (round === 3) {
            setRound3BirthDateByCard((prev) => ({
              ...prev,
              [droppedCardId]: chipName,
            }));
          }

          setGameState((prev) => {
            let nextChips = prev.chips.filter((c) => c.id !== nameId);
            if (willBeComplete) {
              nextChips = nextChips.filter((c) => !c.isDistractor);
            }
            return {
              ...prev,
              chips: nextChips,
              ...(willBeComplete && round === maxRounds
                ? { showSuccess: true, successReason: "victory" as const }
                : {}),
            };
          });

          setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "correct" }));

          const existing = feedbackCorrectTimersRef.current[droppedCardId];
          if (existing) clearTimeout(existing);
          feedbackCorrectTimersRef.current[droppedCardId] = setTimeout(() => {
            setCardFeedback((prev) => ({ ...prev, [droppedCardId]: "idle" }));
            feedbackCorrectTimersRef.current[droppedCardId] = null;
          }, FEEDBACK_OVERLAY_MS);

          if (willBeComplete) {
            playSfx("complete");
            // Transiciones internas entre rondas:
            // - Ronda 1 -> transición "Relationships"
            // - Ronda 2 -> transición "Birthday"
            if (round < maxRounds) {
              setGamePhase("transition");
            }
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
    [
      advanceToNextRound,
      gameState.cards.length,
      gameState.chips,
      libraryDeck,
      maxRounds,
      playSfx,
      resolvedByCard,
      round,
    ]
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

  const handleRestart = () => {
    // Reinicio completo al comienzo del flow interno de rondas
    setRemainingSeconds(initialSeconds);
    resetRoundState(1);
  };

  /** Menú de pausa: Restart → ronda 1, cierra el modal */
  const handlePauseRestart = () => {
    setIsPaused(false);
    setGameState((prev) => ({ ...prev, isPaused: false }));
    handleRestart();
  };

  const handleCloseGame = () => {
    // Volver a modo play sin resetear
    setMode("play");
  };

  // Juego completo cuando no quedan chips “reales” (los distractores no cuentan)
  const isGameComplete = gameState.chips.filter((c) => !c.isDistractor).length === 0;

  // Timer countdown: 2:00 → 0:00, cada segundo en play mode (se detiene en pausa o en pantalla final)
  useEffect(() => {
    if (mode !== "play" || isPaused || gameState.showSuccess || gamePhase !== "playing")
      return;
    const interval = setInterval(() => {
      setRemainingSeconds((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [gamePhase, mode, isPaused, gameState.showSuccess]);

  // Al llegar a 0:00:
  // - mostrar el timeout reveal (time's up) para la ronda actual
  // - luego progresar automáticamente a la transición siguiente (o end/results si es la última)
  useEffect(() => {
    if (mode !== "play" || isPaused || gamePhase !== "playing" || gameState.showSuccess)
      return;
    if (remainingSeconds === 0) {
      setGameState((prev) => ({
        ...prev,
        showSuccess: true,
        successReason: "timeUp",
        chips: prev.chips.filter((c) => !c.isDistractor),
      }));
    }
  }, [gamePhase, gameState.showSuccess, mode, isPaused, remainingSeconds]);

  // Al cruzar al umbral de tiempo bajo: tick cada segundo hasta 0; para si termina el juego o llega a 0
  useEffect(() => {
    const inLowTime =
      mode === "play" &&
      !isPaused &&
      !gameState.showSuccess &&
      gamePhase === "playing" &&
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

  const round1IdentityMapping =
    libraryDeck?.mappingNames ?? CORRECT_MAPPING_ROUND_NAMES;

  // En reveal mode, crear resolvedByCard automático usando mapping de nombres (Round 1/3)
  const revealResolvedByCard = mode === "reveal"
    ? chipToCardMappingToResolved(round1IdentityMapping)
    : resolvedByCard;

  // Endgame por tiempo: misma UI que el juego; contenido dinámico según progreso real (solo uniones pendientes)
  const isTimeUpEndgame = !!(
    gameState.showSuccess && gameState.successReason === "timeUp"
  );
  const timeUpRemainingCards = gameState.cards.filter(
    (c) => !resolvedByCard[c.id]
  );
  /** Respuestas correctas (etiqueta de chip) por card, según la ronda — no solo nombres de ronda 1 */
  const timeUpResolvedByCard = useMemo(() => {
    if (!isTimeUpEndgame) return {};
    const remainingIds = new Set(timeUpRemainingCards.map((c) => c.id));
    if (remainingIds.size === 0) return {};
    const deckMap =
      libraryDeck?.mappingsPerRound[round - 1] ??
      (round === 2
        ? CORRECT_MAPPING_ROUND_RELATIONSHIPS
        : round === 3
          ? CORRECT_MAPPING_ROUND_BIRTHDAYS
          : CORRECT_MAPPING_ROUND_NAMES);
    const acc: Record<string, string> = {};
    for (const [chipLabel, cardId] of Object.entries(deckMap)) {
      if (!cardId || cardId === "__distractor__") continue;
      if (remainingIds.has(cardId)) acc[cardId] = chipLabel;
    }
    return acc;
  }, [
    isTimeUpEndgame,
    timeUpRemainingCards,
    round,
    libraryDeck?.mappingsPerRound,
  ]);
  const cardsForDisplay = isTimeUpEndgame
    ? timeUpRemainingCards
    : gameState.cards;

  // Pantalla final por éxito (todas correctas): mismo layout que time's up; todas las cards con nombres correctos
  const isSuccessEndgame = !!(
    gameState.showSuccess && gameState.successReason === "victory"
  );
  const successResolvedByCard =
    chipToCardMappingToResolved(round1IdentityMapping);
  const relationshipFinal =
    libraryDeck?.relationshipByCardId ?? RELATIONSHIP_BY_CARD_ROUND_2_FINAL;
  const preResolvedByCardForIdentityRounds =
    round === 2 || round === 3 ? successResolvedByCard : {};
  /** Time up: solo `resolvedChipName` (respuesta chip); evita duplicar “is my …” / fecha bajo el mismo texto */
  /** En victoria: usar conexiones reales del jugador (IDs del mazo), no el mapping mock de demos */
  const relationshipByCardForDisplay =
    round === 2
      ? isTimeUpEndgame
        ? {}
        : round2RelationshipByCard
      : round === 3
        ? isTimeUpEndgame
          ? {}
          : isSuccessEndgame
            ? round2RelationshipByCard
            : relationshipFinal
        : {};
  const birthDateByCardForDisplay =
    round === 3 ? (isTimeUpEndgame ? {} : round3BirthDateByCard) : {};
  const resolvedByCardForDisplay = isTimeUpEndgame
    ? timeUpResolvedByCard
    : isSuccessEndgame
      ? resolvedByCard
      : round === 2 || round === 3
        ? preResolvedByCardForIdentityRounds
      : mode === "reveal"
        ? revealResolvedByCard
        : resolvedByCard;
  const isFinalScreen = isTimeUpEndgame || isSuccessEndgame;

  const showRoundIntroOverlays =
    (gamePhase === "preRoundIntro" && round === 1) ||
    (gamePhase === "transition" && round < maxRounds);

  const introCopy = useMemo(() => {
    if (!showRoundIntroOverlays) return { displayRound: 1 as const, category: "" };
    return getRoundIntroCopy(
      gamePhase === "transition" ? "transition" : "preRoundIntro",
      round,
      libraryDeck?.roundCategoryLabels
    );
  }, [gamePhase, libraryDeck?.roundCategoryLabels, round, showRoundIntroOverlays]);

  const buildEndgameSnapshot = useCallback((): GameEndgameSnapshot => {
    const chipsRow =
      gameState.chips.length > 0
        ? gameState.chips
        : libraryDeck?.roundChips[round - 1] ?? getRoundData(round).chips;
    const stackedLines =
      Object.keys(cardContentLinesByCard).length > 0
        ? cardContentLinesByCard
        : buildStackedLinesFallback(
            gameState.cards,
            resolvedByCardForDisplay,
            relationshipByCardForDisplay,
            birthDateByCardForDisplay
          );

    return {
      remainingSeconds,
      lives: gameState.lives,
      cards: gameState.cards,
      resolvedByCard: resolvedByCardForDisplay,
      relationshipByCard: relationshipByCardForDisplay,
      birthDateByCard: birthDateByCardForDisplay,
      cardContentLinesByCard: stackedLines,
      chips: chipsRow,
      finalRound: round,
      maxRounds,
    };
  }, [
    cardContentLinesByCard,
    remainingSeconds,
    gameState.lives,
    gameState.cards,
    gameState.chips,
    resolvedByCardForDisplay,
    relationshipByCardForDisplay,
    birthDateByCardForDisplay,
    libraryDeck?.roundChips,
    round,
    maxRounds,
  ]);

  const handleContinueAfterEndgame = useCallback(() => {
    // En timeout de rondas 1/2, no reiniciamos: la progresión es automática.
    if (isTimeUpEndgame && round < maxRounds) return;
    // Pantalla de resultados solo en la última ronda (victoria o tiempo agotado).
    if (
      (isSuccessEndgame || isTimeUpEndgame) &&
      round === maxRounds &&
      onContinueFromEndgame
    ) {
      onContinueFromEndgame(buildEndgameSnapshot());
      return;
    }
    handleRestart();
  }, [
    buildEndgameSnapshot,
    handleRestart,
    isSuccessEndgame,
    isTimeUpEndgame,
    maxRounds,
    onContinueFromEndgame,
    round,
  ]);

  // Auto-progresión tras el reveal de timeout (última ronda → snapshot + resultados)
  useEffect(() => {
    const isTimeUp = gameState.showSuccess && gameState.successReason === "timeUp";
    if (!isTimeUp) return;
    const t = setTimeout(() => {
      if (round < maxRounds) {
        if (round === 1) {
          const mapping = libraryDeck?.mappingNames ?? CORRECT_MAPPING_ROUND_NAMES;
          setResolvedByCard(chipToCardMappingToResolved(mapping));
        } else if (round === 2) {
          setRound2RelationshipByCard(
            libraryDeck?.relationshipByCardId ?? RELATIONSHIP_BY_CARD_ROUND_2_FINAL
          );
        }

        setGameState((prev) => ({
          ...prev,
          showSuccess: false,
          successReason: undefined,
          chips: prev.chips.filter((c) => !c.isDistractor),
        }));
        setMode("play");
        setGamePhase("transition");
        return;
      }

      if (onContinueFromEndgame) onContinueFromEndgame(buildEndgameSnapshot());
      else handleRestart();
    }, TIME_UP_DISPLAY_MS);

    return () => clearTimeout(t);
  }, [
    buildEndgameSnapshot,
    gameState.showSuccess,
    gameState.successReason,
    handleRestart,
    libraryDeck?.mappingNames,
    libraryDeck?.relationshipByCardId,
    maxRounds,
    onContinueFromEndgame,
    round,
  ]);

  // Victoria: “Good job!” centrado; al terminar la animación pasa sola a resultados
  useEffect(() => {
    if (!isSuccessEndgame || round !== maxRounds) return;
    const id = window.setTimeout(() => {
      handleContinueAfterEndgame();
    }, VICTORY_GOOD_JOB_AUTO_MS);
    return () => clearTimeout(id);
  }, [handleContinueAfterEndgame, isSuccessEndgame, maxRounds, round]);

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
    <div className="game-viewport-lock relative w-full">
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

      {/* Contenedor del juego: se bloquea en pausa, reveal, transición o pantallas finales */}
      <div
        className="h-full min-h-0"
        style={
          isPaused ||
            mode === "reveal" ||
            isFinalScreen ||
            gamePhase === "transition" ||
            gamePhase === "preRoundIntro"
            ? { pointerEvents: "none" }
            : undefined
        }
      >
        <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
          {gamePhase !== "transition" && !isSuccessEndgame && (
            <TopHUD
              lives={gameState.lives}
              elapsedSeconds={remainingSeconds}
              isMuted={effectiveIsMuted}
              mode={mode}
              lowTimeThreshold={LOW_TIME_THRESHOLD}
              onPauseClick={handleTogglePause}
              onMuteToggle={handleMuteToggle}
            />
          )}

          <main
            className="flex min-h-0 flex-1 flex-col items-center overflow-hidden w-full"
            style={{
              // Sin HUD en transición: no sumar margen extra (evita overflow / micro-scroll)
              marginTop: gamePhase === "transition" ? 0 : "58px",
              ...(isTimeUpEndgame ? { paddingBottom: "48px" } : {}),
            }}
          >
            {isTimeUpEndgame ? (
              <>
                <p
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 700,
                    fontSize: "32px",
                    color: "#FFFFFF",
                    textAlign: "center",
                  }}
                >
                  Time&apos;s up
                </p>
                {round < maxRounds ? (
                  <p
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontWeight: 600,
                      fontSize: "20px",
                      color: "rgba(255, 255, 255, 0.85)",
                      textAlign: "center",
                      marginTop: "12px",
                    }}
                  >
                    Next round…
                  </p>
                ) : null}
                {(showCardsAndChips || isFinalScreen) && (
                  <div ref={canvasRef} style={{ marginTop: "32px", width: "100%", maxWidth: "1200px" }}>
                    <CardStage
                      cards={cardsForDisplay}
                      highlightedCardId={null}
                      cardStatus={cardStatus}
                      resolvedByCard={resolvedByCardForDisplay}
                      cardFeedback={cardFeedback}
                      onCardHover={() => {}}
                      onCardDrop={handleCardDrop}
                      connectSlotRef={registerConnectSlot}
                      animateMount={false}
                      showSlotArrow={false}
                      activeOriginCardId={null}
                      showConnectSlotWhenResolved={round === 2 || round === 3}
                      relationshipByCard={relationshipByCardForDisplay}
                      relationshipLabelPossessive={relationshipLabelPossessive}
                      keepConnectorWhenRelationship={round === 3}
                      resolvedConnectorExtraOffsetPx={round === 3 ? 22 : 0}
                      birthDateByCard={birthDateByCardForDisplay}
                      cardContentLinesByCard={cardContentLinesByCard}
                      round={round}
                      photosOnly={false}
                    />
                  </div>
                )}
              </>
            ) : isSuccessEndgame ? (
              /* Overlay fijo centrado (globals); sin Continue — avanza solo tras VICTORY_GOOD_JOB_AUTO_MS */
              <div className="relative min-h-[min(60vh,520px)] w-full flex-1 shrink-0">
                <div
                  className="victory-celebration-overlay"
                  style={{ pointerEvents: "none" }}
                  aria-live="polite"
                >
                  <VictoryConfetti intensity="full" />
                  <div className="victory-celebration-title-stack">
                    <div className="victory-celebration-halo" aria-hidden />
                    <p className="victory-celebration-goodjob-display">Good job!</p>
                  </div>
                </div>
              </div>
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
            ) : gamePhase === "transition" || gamePhase === "preRoundIntro" ? (
              <>
                {/* Placeholder invisible para mantener altura/layout */}
                <div className="game-title-enter" style={{ visibility: "hidden" }}>
                  <GameInstruction />
                </div>
                {showCardsAndChips && (
                  <div
                    ref={canvasRef}
                    style={{
                      marginTop: 0,
                      position: "fixed",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      zIndex: 30,
                    }}
                    className="round-transition-flip"
                  >
                    <CardStage
                      cards={cardsForDisplay}
                      highlightedCardId={isFinalScreen ? null : activeCardId}
                      cardStatus={cardStatus}
                      resolvedByCard={resolvedByCardForDisplay}
                      cardFeedback={cardFeedback}
                      onCardHover={() => {}}
                      onCardDrop={handleCardDrop}
                      connectSlotRef={registerConnectSlot}
                      animateMount={false}
                      showSlotArrow={!activeChipId}
                      activeOriginCardId={activeOriginCardId}
                      showConnectSlotWhenResolved={false}
                      relationshipByCard={relationshipByCardForDisplay}
                      relationshipLabelPossessive={relationshipLabelPossessive}
                      keepConnectorWhenRelationship={round === 3}
                      resolvedConnectorExtraOffsetPx={round === 3 ? 22 : 0}
                      birthDateByCard={birthDateByCardForDisplay}
                      cardContentLinesByCard={cardContentLinesByCard}
                      round={round}
                      photosOnly={
                        gamePhase === "preRoundIntro" || gamePhase === "transition"
                      }
                    />
                  </div>
                )}
              </>
            ) : (
              <div
                className="game-playfield-soft-enter"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: playfieldAppear ? 1 : 0,
                  transform: playfieldAppear ? "translateY(0)" : "translateY(14px)",
                  transition:
                    "opacity 1.05s cubic-bezier(0.22, 1, 0.36, 1), transform 1.05s cubic-bezier(0.22, 1, 0.36, 1)",
                  pointerEvents: playfieldAppear ? "auto" : "none",
                }}
              >
                <div className="game-title-enter">
                  {round === 1 ? (
                    libraryDeck ? (
                      <p
                        style={{
                          fontFamily: "var(--font-bitter), serif",
                          fontWeight: 600,
                          fontSize: "32px",
                          color: "#FFFFFF",
                          textAlign: "center",
                        }}
                      >
                        Match each photo to the correct{" "}
                        <span style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                          {libraryDeck.roundCategoryLabels[0] ?? "answer"}
                        </span>
                      </p>
                    ) : (
                      <GameInstruction />
                    )
                  ) : round === 2 ? (
                    <p
                      style={{
                        fontFamily: "var(--font-bitter), serif",
                        fontWeight: 600,
                        fontSize: "32px",
                        color: "#FFFFFF",
                        textAlign: "center",
                      }}
                    >
                      {libraryDeck
                        ? `Match each photo to the correct ${libraryDeck.roundCategoryLabels[1] ?? "answer"}`
                        : "Select their relationship to you"}
                    </p>
                  ) : (
                    <p
                      style={{
                        fontFamily: "var(--font-bitter), serif",
                        fontWeight: 600,
                        fontSize: "32px",
                        color: "#FFFFFF",
                        textAlign: "center",
                      }}
                    >
                      {libraryDeck
                        ? `Match each photo to the correct ${libraryDeck.roundCategoryLabels[2] ?? "answer"}`
                        : "Connect everyone to their birthday\u0027s"}
                    </p>
                  )}
                </div>
                {showCardsAndChips && (
                  <>
                    <div ref={canvasRef} style={{ marginTop: "32px" }}>
                      <CardStage
                        cards={cardsForDisplay}
                        highlightedCardId={isFinalScreen ? null : activeCardId}
                        cardStatus={cardStatus}
                        resolvedByCard={resolvedByCardForDisplay}
                        cardFeedback={cardFeedback}
                        onCardHover={() => {}}
                        onCardDrop={handleCardDrop}
                        connectSlotRef={registerConnectSlot}
                        animateMount={mode === "play" && playfieldAppear}
                        showSlotArrow={!activeChipId}
                        activeOriginCardId={activeOriginCardId}
                        showConnectSlotWhenResolved={(round === 2 || round === 3) && gamePhase === "playing"}
                        relationshipByCard={relationshipByCardForDisplay}
                        relationshipLabelPossessive={relationshipLabelPossessive}
                        keepConnectorWhenRelationship={round === 3}
                        resolvedConnectorExtraOffsetPx={round === 3 ? 22 : 0}
                        birthDateByCard={birthDateByCardForDisplay}
                        cardContentLinesByCard={cardContentLinesByCard}
                        round={round}
                        photosOnly={false}
                      />
                    </div>
                    {!isFinalScreen && gamePhase === "playing" && (
                      <div ref={chipsContainerRef} style={{ marginTop: "160px" }}>
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
              </div>
            )}
          </main>
        </div>

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
        ) : null}

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
        <PauseMenu
          onResume={handleTogglePause}
          onRestart={handlePauseRestart}
          onQuit={() => {}}
        />
      )}

      {showRoundIntroOverlays && (
        <>
          {roundIntroStep === "roundNum" && (
            <div className="round-transition-title-overlay">
              <p
                className="round-transition-title-enter round-transition-title-layer"
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "56px",
                  color: "#FFFFFF",
                  textAlign: "center",
                  margin: 0,
                  pointerEvents: "none",
                }}
              >
                <span style={{ color: "#FFFFFF" }}>Round </span>
                <span style={{ color: "#FFFFFF" }}>{introCopy.displayRound}</span>
              </p>
            </div>
          )}

          {(roundIntroStep === "category" || roundIntroStep === "cards") && (
            <div className="round-transition-title-overlay">
              <p
                className={
                  roundIntroStep === "category"
                    ? "round-transition-title-enter round-transition-title-layer"
                    : "round-transition-title-static round-transition-title-layer"
                }
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "56px",
                  color: "#FFFFFF",
                  textAlign: "center",
                  margin: 0,
                  pointerEvents: "none",
                }}
              >
                {introCopy.category}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
