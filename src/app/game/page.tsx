"use client";

import { useState, useEffect, useRef } from "react";
import { Background } from "@/components/game/Background";
import { GameDescriptionScreen } from "@/components/intro/GameDescriptionScreen";
import { SpecsScreen } from "@/components/specs/SpecsScreen";
import { SpecsStep2PracticeScreen } from "@/components/specs/SpecsStep2PracticeScreen";
import { SpecsStep3TopicScreen } from "@/components/specs/SpecsStep3TopicScreen";
import { CoachScreen } from "@/components/game/coach/CoachScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { RewardVideoScreen } from "@/components/game/RewardVideoScreen";
import { ResultsScreen } from "@/components/results";

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075;

/** Paso 1 Specs (Figma): solo "Persons" es elegible en esta pantalla */
const SPECS_STEP1_OPTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "persons", label: "Persons" },
  { id: "places", label: "Places" },
  { id: "objects", label: "Objects" },
  { id: "pets", label: "Pets" },
  { id: "events", label: "Events" },
  { id: "other", label: "Other" },
];

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

type GameDifficulty = "easy" | "medium";

type GameConfig = {
  secondsPerRound: number;
  difficulty: GameDifficulty;
};

export default function GamePage() {
  const [stage, setStage] = useState<GameStage>("intro");
  const [isMuted, setIsMuted] = useState<boolean>(false); // Por defecto sonido encendido
  const [mounted, setMounted] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    secondsPerRound: 58,
    difficulty: "medium",
  });
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {stage === "intro" && (
          <GameDescriptionScreen
            highScore={0}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            onCustomStart={(settings) => {
              setGameConfig(settings);
              setStage("specs1");
            }}
            onQuickPlayStart={(settings) => {
              setGameConfig(settings);
              setStage("specs1");
            }}
            embedded
          />
        )}
        {stage === "specs1" && (
          <SpecsScreen
            onContinue={() => setStage("specs2")}
            onBack={() => setStage("intro")}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            title="Select your Focus Group or Groups"
            subtitle="Select up to 3 topics"
            options={SPECS_STEP1_OPTIONS}
            onlySelectableLabel="Persons"
            tipLabel="TIP"
            tipText="Match each photo with best answer to the question. Be fast."
            showStartRandomGamePlaceholder
            showStepIndicator={false}
          />
        )}
        {stage === "specs2" && (
          <SpecsStep2PracticeScreen
            onContinue={() => setStage("specs3")}
            onBack={() => setStage("specs1")}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
          />
        )}
        {stage === "specs3" && (
          <SpecsStep3TopicScreen
            onContinue={() => setStage("coach")}
            onBack={() => setStage("specs2")}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
          />
        )}
        {stage === "coach" && (
          <CoachScreen onContinue={() => setStage("play")} />
        )}
        {stage === "play" && (
          <GameScreen
            skipBackground
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            onContinueFromEndgame={() => setStage("rewardVideo")}
            initialRoundSeconds={gameConfig.secondsPerRound}
            difficulty={gameConfig.difficulty}
          />
        )}
        {stage === "rewardVideo" && (
          <RewardVideoScreen onComplete={() => setStage("results")} />
        )}
        {stage === "results" && (
          <ResultsScreen />
        )}
      </div>
    </div>
  );
}
