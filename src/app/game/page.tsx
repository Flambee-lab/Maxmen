"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Background } from "@/components/game/Background";
import { GameDescriptionScreen } from "@/components/intro/GameDescriptionScreen";
import { SpecsScreen } from "@/components/specs/SpecsScreen";
import { SpecsStep2PracticeScreen } from "@/components/specs/SpecsStep2PracticeScreen";
import { SpecsStep3TopicScreen } from "@/components/specs/SpecsStep3TopicScreen";
import { CoachScreen } from "@/components/game/coach/CoachScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { RewardVideoScreen } from "@/components/game/RewardVideoScreen";
import { ResultsScreen } from "@/components/results";
import type { GameDifficulty } from "@/types/game";
import type {
  ContentItem,
  PersonContentItem,
  PersonSubgroup,
  Topic,
} from "@/types/contentLibrary";
import type { GameLibraryDeck } from "@/types/gameLibraryDeck";
import type { GameEndgameSnapshot } from "@/types/gameEndgameSnapshot";
import { CONTENT_LIBRARY_UPDATED_EVENT } from "@/lib/contentLibrary/events";
import { getContentRepository } from "@/lib/contentLibrary/repository";
import { buildMixedRoundQuestionOptions } from "@/lib/game/questionTypesFromContent";
import {
  buildContentGameLibrary,
  buildPersonGameLibrary,
} from "@/lib/game/buildPersonGameLibrary";
import {
  buildMixedTopicGameLibrary,
  parseCompositeRoundSpecIds,
} from "@/lib/game/mixedTopicGameLibrary";
import {
  buildTopicOptionsFromContent,
  buildSubgroupOptionsFromPersons,
  filterContentBySpecsSelection,
  TOPIC_LABELS,
} from "@/lib/game/specsOptionsFromContent";
import { DEFAULT_SECONDS_PER_ROUND } from "@/lib/gameRoundConfig";

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075;

type GameStage =
  | "intro"
  | "specs1"
  | "specs2"
  | "specs3"
  | "coach"
  | "play"
  | "rewardVideo"
  | "results";

/** Para saltar a una etapa con ?stage= (solo desarrollo / preview) */
const STAGES_FROM_QUERY: readonly GameStage[] = [
  "intro",
  "specs1",
  "specs2",
  "specs3",
  "coach",
  "play",
  "rewardVideo",
  "results",
] as const;

type GameConfig = {
  secondsPerRound: number;
  difficulty: GameDifficulty;
};

function shuffleIds<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function imagesPerRoundForDifficulty(d: GameDifficulty): number {
  if (d === "easy") return 3;
  if (d === "hard") return 5;
  return 4;
}

function buildDeckForCustomGame(
  items: ContentItem[],
  topicIds: string[],
  subgroup: PersonSubgroup | null,
  compositeQuestionIds: string[],
  difficulty: GameDifficulty
): GameLibraryDeck | null {
  const pool = filterContentBySpecsSelection(items, topicIds, subgroup);
  if (compositeQuestionIds.length === 0) return null;
  const maxCards = imagesPerRoundForDifficulty(difficulty);

  let roundSpecs: ReturnType<typeof parseCompositeRoundSpecIds>;
  try {
    roundSpecs = parseCompositeRoundSpecIds(compositeQuestionIds);
  } catch {
    return null;
  }

  const singleTopic =
    roundSpecs.length > 0 &&
    roundSpecs.every((r) => r.topic === roundSpecs[0].topic);
  const onlyTopic = roundSpecs[0]?.topic;

  if (singleTopic && onlyTopic === "persons") {
    const persons = pool.filter((i): i is PersonContentItem => i.topic === "persons");
    const qids = roundSpecs.map((r) => r.questionId);
    const deck = buildPersonGameLibrary(persons, qids, { maxCards });
    if (deck) return deck;
  }

  if (singleTopic && onlyTopic && onlyTopic !== "persons") {
    const topicPool = pool.filter((i) => i.topic === onlyTopic);
    const qids = roundSpecs.map((r) => r.questionId);
    const deck = buildContentGameLibrary(topicPool, qids, { maxCards });
    if (deck) return deck;
  }

  return buildMixedTopicGameLibrary(pool, roundSpecs, { maxCards });
}

/**
 * Partida rápida: personas del repositorio + tipos de pregunta aleatorios (hasta 3 rondas).
 */
async function buildQuickPlayDeck(settings: GameConfig): Promise<GameLibraryDeck | null> {
  const items = await getContentRepository().getAll();
  const topicsInLibrary = new Set(items.map((i) => i.topic));
  const topicIds = [...topicsInLibrary];
  const mixedOpts = buildMixedRoundQuestionOptions(items, topicIds);
  if (mixedOpts.length === 0) return null;

  const orderedIds = mixedOpts.map((o) => o.id);
  const shuffledIds = shuffleIds(orderedIds);
  const maxQuestions = Math.min(3, orderedIds.length);
  const maxCards = imagesPerRoundForDifficulty(settings.difficulty);

  const trySpecs = (ids: string[]) => {
    for (let n = Math.min(maxQuestions, ids.length); n >= 1; n--) {
      const slice = ids.slice(0, n);
      let specs: ReturnType<typeof parseCompositeRoundSpecIds>;
      try {
        specs = parseCompositeRoundSpecIds(slice);
      } catch {
        continue;
      }
      const singleTopic =
        specs.length > 0 && specs.every((r) => r.topic === specs[0].topic);
      const t0 = specs[0]?.topic;

      if (singleTopic && t0 === "persons") {
        const persons = items.filter((i): i is PersonContentItem => i.topic === "persons");
        const qids = specs.map((r) => r.questionId);
        const deck = buildPersonGameLibrary(persons, qids, { maxCards });
        if (deck) return deck;
      } else if (singleTopic && t0 && t0 !== "persons") {
        const topicPool = items.filter((i) => i.topic === t0);
        const qids = specs.map((r) => r.questionId);
        const deck = buildContentGameLibrary(topicPool, qids, { maxCards });
        if (deck) return deck;
      } else {
        const deck = buildMixedTopicGameLibrary(items, specs, { maxCards });
        if (deck) return deck;
      }
    }
    return null;
  };

  return trySpecs(shuffledIds) ?? trySpecs(orderedIds);
}

export default function GamePage() {
  const [stage, setStage] = useState<GameStage>("intro");
  const [isMuted, setIsMuted] = useState<boolean>(false); // Por defecto sonido encendido
  const [mounted, setMounted] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    secondsPerRound: DEFAULT_SECONDS_PER_ROUND,
    difficulty: "medium",
  });
  /** Fuerza remount de GameScreen al entrar en play (evita timer inicial con estado viejo). */
  const [playSessionId, setPlaySessionId] = useState(0);
  /** Quick Play o flujo custom (Specs): mazo desde la biblioteca; null → mocks en GameScreen. */
  const [quickPlayDeck, setQuickPlayDeck] = useState<GameLibraryDeck | null>(null);
  /** Estado capturado al terminar la partida para `GameResultsRecap` */
  const [endgameSnapshot, setEndgameSnapshot] = useState<GameEndgameSnapshot | null>(null);
  const [quickPlayLoading, setQuickPlayLoading] = useState(false);
  const [libraryItems, setLibraryItems] = useState<ContentItem[]>([]);
  /** Specs: topics seleccionados en paso 1 (ids: persons, places, …) */
  const [specsTopicIds, setSpecsTopicIds] = useState<string[]>([]);
  /** Specs paso 2: subgrupo de personas (solo si se eligió "persons" en paso 1) */
  const [specsSubgroup, setSpecsSubgroup] = useState<PersonSubgroup | null>(null);
  /** Specs paso 3: tipos de pregunta en orden de ronda */
  const [specsQuestionIds, setSpecsQuestionIds] = useState<string[]>([]);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    void getContentRepository()
      .getAll()
      .then(setLibraryItems)
      .catch(() => setLibraryItems([]));
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      void getContentRepository()
        .getAll()
        .then(setLibraryItems)
        .catch(() => setLibraryItems([]));
    };
    window.addEventListener(CONTENT_LIBRARY_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CONTENT_LIBRARY_UPDATED_EVENT, handler);
  }, [mounted]);

  const topicOptions = useMemo(
    () => buildTopicOptionsFromContent(libraryItems),
    [libraryItems]
  );

  const personItemsForSubgroup = useMemo(
    () =>
      libraryItems.filter((i): i is PersonContentItem => i.topic === "persons"),
    [libraryItems]
  );

  const subgroupOptions = useMemo(
    () => buildSubgroupOptionsFromPersons(personItemsForSubgroup),
    [personItemsForSubgroup]
  );

  const specs3QuestionOptions = useMemo(() => {
    const pool = filterContentBySpecsSelection(
      libraryItems,
      specsTopicIds,
      specsSubgroup
    );
    return buildMixedRoundQuestionOptions(pool, specsTopicIds);
  }, [libraryItems, specsTopicIds, specsSubgroup]);

  const focusGroupsSummary = useMemo(() => {
    if (specsTopicIds.length === 0) return "Your focus groups";
    return specsTopicIds
      .map((id) => TOPIC_LABELS[id as Topic] ?? id)
      .join(", ");
  }, [specsTopicIds]);

  /** Atajo: /game?stage=results (o play, rewardVideo, etc.) sin recorrer el flujo */
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("stage");
      if (!raw) return;
      if ((STAGES_FROM_QUERY as readonly string[]).includes(raw)) {
        setStage(raw as GameStage);
      }
    } catch {
      // ignore
    }
  }, [mounted]);

  // Al montar en cliente: restaurar preferencia de mute desde localStorage (persiste en toda la app)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(MUTED_STORAGE_KEY);
      if (saved === "true") setIsMuted(true);
      // Si no hay valor o es "false", dejamos isMuted en false (sonido encendido)
    } catch {
      // ignore
    }
  }, []);

  // Música de fondo global para toda la experiencia (intro → specs → coach → play)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio("/lofi.mp3");
    audio.loop = true;
    audio.volume = isMuted ? 0 : BG_VOLUME;
    bgAudioRef.current = audio;

    let startOnInteraction: (() => void) | null = null;

    const tryPlay = () => {
      const runPlay = () => {
        const p = audio.play();
        if (p === undefined) return Promise.resolve();
        return p;
      };
      runPlay().catch(() => {
        startOnInteraction = () => {
          void runPlay().catch(() => {});
          if (startOnInteraction) {
            window.removeEventListener("pointerdown", startOnInteraction);
          }
        };
        window.addEventListener("pointerdown", startOnInteraction);
      });
    };

    audio.addEventListener("canplaythrough", tryPlay, { once: true });
    tryPlay();

    return () => {
      if (startOnInteraction) {
        window.removeEventListener("pointerdown", startOnInteraction);
      }
      audio.pause();
      audio.currentTime = 0;
      bgAudioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez al montar la página

  // Sincronizar mute con localStorage y volumen
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(MUTED_STORAGE_KEY, isMuted ? "true" : "false");
      } catch {
        // ignore
      }
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = isMuted ? 0 : BG_VOLUME;
    }
  }, [isMuted]);

  useEffect(() => {
    if (stage === "play") setEndgameSnapshot(null);
  }, [stage]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white/80">Cargando...</p>
      </div>
    );
  }

  return (
    <div
      className={
        stage === "results"
          ? "relative h-screen overflow-hidden"
          : stage === "play"
            ? "relative game-viewport-lock overflow-hidden"
            : "relative min-h-screen overflow-hidden"
      }
    >
      {/* Resultados: fondo propio (Figma); evita el aro/halos del resto del juego */}
      {stage !== "results" && <Background />}
      <div
        className={
          stage === "results"
            ? "relative z-10 h-full min-h-0 w-full"
            : stage === "play"
              ? "relative z-10 h-full min-h-0 w-full overflow-hidden"
              : "relative z-10 h-full min-h-screen w-full"
        }
      >
        {stage === "intro" && quickPlayLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <p className="text-lg text-white/90">Preparando partida rápida…</p>
          </div>
        )}
        {stage === "intro" && (
          <GameDescriptionScreen
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            onCustomStart={(settings) => {
              setQuickPlayDeck(null);
              setSpecsTopicIds([]);
              setSpecsSubgroup(null);
              setSpecsQuestionIds([]);
              setGameConfig({
                secondsPerRound:
                  typeof settings.secondsPerRound === "number" &&
                  Number.isFinite(settings.secondsPerRound) &&
                  settings.secondsPerRound > 0
                    ? Math.floor(settings.secondsPerRound)
                    : DEFAULT_SECONDS_PER_ROUND,
                difficulty: settings.difficulty,
              });
              setStage("specs1");
            }}
            onQuickPlayStart={(settings) => {
              setGameConfig({
                secondsPerRound:
                  typeof settings.secondsPerRound === "number" &&
                  Number.isFinite(settings.secondsPerRound) &&
                  settings.secondsPerRound > 0
                    ? Math.floor(settings.secondsPerRound)
                    : DEFAULT_SECONDS_PER_ROUND,
                difficulty: settings.difficulty,
              });
              setQuickPlayLoading(true);
              void (async () => {
                try {
                  const deck = await buildQuickPlayDeck(settings);
                  setQuickPlayDeck(deck);
                  setPlaySessionId((id) => id + 1);
                  setStage("play");
                } finally {
                  setQuickPlayLoading(false);
                }
              })();
            }}
            embedded
          />
        )}
        {stage === "specs1" && (
          <SpecsScreen
            onContinue={(selected) => {
              setSpecsTopicIds(selected);
              if (selected.includes("persons")) {
                setStage("specs2");
              } else {
                setSpecsSubgroup(null);
                setStage("specs3");
              }
            }}
            onBack={() => {
              setSpecsTopicIds([]);
              setSpecsSubgroup(null);
              setSpecsQuestionIds([]);
              setStage("intro");
            }}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            title="Select your Focus Group or Groups"
            subtitle="Select up to 3 topics"
            options={topicOptions}
            selectById
            maxSelectable={Math.min(3, Math.max(0, topicOptions.length))}
            tipLabel="TIP"
            tipText="Match each photo with best answer to the question. Be fast."
            showStartRandomGamePlaceholder
            showStepIndicator={false}
          />
        )}
        {stage === "specs2" && (
          <SpecsStep2PracticeScreen
            subgroupOptions={subgroupOptions}
            libraryPersons={personItemsForSubgroup}
            onContinue={(subgroup) => {
              setSpecsSubgroup(subgroup);
              setStage("specs3");
            }}
            onBack={() => {
              setSpecsSubgroup(null);
              setStage("specs1");
            }}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
          />
        )}
        {stage === "specs3" && (
          <SpecsStep3TopicScreen
            questionOptions={specs3QuestionOptions}
            onContinue={(ids) => {
              setSpecsQuestionIds(ids);
              setStage("coach");
            }}
            onBack={() => {
              setSpecsQuestionIds([]);
              if (specsTopicIds.includes("persons")) setStage("specs2");
              else setStage("specs1");
            }}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            focusContextPillText={focusGroupsSummary}
          />
        )}
        {stage === "coach" && (
          <CoachScreen
            onContinue={() => {
              const deck = buildDeckForCustomGame(
                libraryItems,
                specsTopicIds,
                specsSubgroup,
                specsQuestionIds,
                gameConfig.difficulty
              );
              setQuickPlayDeck(deck);
              setPlaySessionId((id) => id + 1);
              setStage("play");
            }}
          />
        )}
        {stage === "play" && (
          <GameScreen
            key={`play-${playSessionId}`}
            skipBackground
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            /* Resultados con diseño Figma (sidebar, gráficos): mismo componente que /results */
            onContinueFromEndgame={(snap) => {
              setEndgameSnapshot(snap);
              setStage("results");
            }}
            initialRoundSeconds={gameConfig.secondsPerRound}
            difficulty={gameConfig.difficulty}
            libraryDeck={quickPlayDeck ?? undefined}
          />
        )}
        {stage === "rewardVideo" && (
          <RewardVideoScreen
            onComplete={() => {
              setEndgameSnapshot(null);
              setStage("results");
            }}
          />
        )}
        {stage === "results" && (
          <ResultsScreen
            gameSnapshot={endgameSnapshot}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            onRecapClose={() => {
              setEndgameSnapshot(null);
              setStage("intro");
            }}
            onRecapPrimaryContinue={() => setStage("rewardVideo")}
            onRecapRestart={() => {
              setEndgameSnapshot(null);
              setPlaySessionId((id) => id + 1);
              setStage("play");
            }}
          />
        )}
      </div>
    </div>
  );
}
