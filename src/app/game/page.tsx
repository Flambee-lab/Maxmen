"use client";

import { useState, useEffect, useRef } from "react";
import { Background } from "@/components/game/Background";
import { GameDescriptionScreen } from "@/components/intro/GameDescriptionScreen";
import { SpecsScreen } from "@/components/specs/SpecsScreen";
import { CoachScreen } from "@/components/game/coach/CoachScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { RewardVideoScreen } from "@/components/game/RewardVideoScreen";
import { ResultsScreen } from "@/components/game/ResultsScreen";

const MUTED_STORAGE_KEY = "maxman_sound_muted";
const BG_VOLUME = 0.075;

type GameStage = "intro" | "specs" | "coach" | "play" | "rewardVideo" | "results";

export default function GamePage() {
  const [stage, setStage] = useState<GameStage>("intro");
  const [isMuted, setIsMuted] = useState<boolean>(false); // Por defecto sonido encendido
  const [mounted, setMounted] = useState(false);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      audio.play().catch(() => {
        startOnInteraction = () => {
          audio.play().catch(() => {});
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
    <div className="relative min-h-screen overflow-hidden">
      <Background />
      <div className="relative z-10 w-full min-h-screen">
        {stage === "intro" && (
          <GameDescriptionScreen
            highScore={0}
            difficulty={4}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted((m) => !m)}
            onStart={() => setStage("specs")}
            embedded
          />
        )}
        {stage === "specs" && (
          <SpecsScreen
            onContinue={() => setStage("coach")}
            onBack={() => setStage("intro")}
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
