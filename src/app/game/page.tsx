"use client";

import { useState, useEffect } from "react";
import { Background } from "@/components/game/Background";
import { GameDescriptionScreen } from "@/components/intro/GameDescriptionScreen";
import { SpecsScreen } from "@/components/specs/SpecsScreen";
import { CoachScreen } from "@/components/game/coach/CoachScreen";
import { GameScreen } from "@/components/game/GameScreen";

export default function GamePage() {
  const [stage, setStage] = useState<"intro" | "specs" | "coach" | "play">("intro");
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {stage === "play" && <GameScreen skipBackground />}
      </div>
    </div>
  );
}
