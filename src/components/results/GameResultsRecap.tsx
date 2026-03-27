"use client";

import { useEffect, useState } from "react";
import { Background } from "@/components/game/Background";
import { VictoryConfetti } from "@/components/game/VictoryConfetti";
import { CardStage } from "@/components/game/CardStage";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { PauseMenu } from "@/components/game/PauseMenu";
import { TopHUD } from "@/components/game/TopHUD";
import type { GameEndgameSnapshot } from "@/types/gameEndgameSnapshot";

/** Duración de “Oops, let's try again” antes del recap con cartas */
const TIMEUP_OOPS_PHASE_MS = 2800;

export interface GameResultsRecapProps {
  snapshot: GameEndgameSnapshot;
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
  /** Victoria: siguiente paso (p. ej. video de recompensa) */
  onPrimaryContinue: () => void;
  /** Restart en pausa o fin por tiempo: nueva partida desde ronda 1 */
  onRestartGame: () => void;
}

/**
 * Resultados post-partida: conexiones finales en las fotos (nombres / relación / fecha),
 * sin fila de chips; HUD congelado.
 * Victoria: confeti + “You completed the game!” + Claim reward.
 * Tiempo agotado (última ronda): 1) “Oops…” → 2) mismo reveal de cartas que victoria, sin confeti + Try again.
 */
export function GameResultsRecap({
  snapshot,
  isMuted,
  onMuteToggle,
  onClose,
  onPrimaryContinue,
  onRestartGame,
}: GameResultsRecapProps) {
  const {
    remainingSeconds,
    lives,
    cards,
    resolvedByCard,
    relationshipByCard,
    birthDateByCard,
    cardContentLinesByCard,
    finalRound,
  } = snapshot;

  const outcome = snapshot.outcome ?? "victory";
  const showRel = finalRound >= 2;
  const showBirth = finalRound >= 3;
  const [isPaused, setIsPaused] = useState(false);
  const [timeUpPhase, setTimeUpPhase] = useState<1 | 2>(1);

  useEffect(() => {
    if (outcome !== "timeUp" || timeUpPhase !== 1) return;
    const t = window.setTimeout(() => setTimeUpPhase(2), TIMEUP_OOPS_PHASE_MS);
    return () => window.clearTimeout(t);
  }, [outcome, timeUpPhase]);

  if (outcome === "timeUp" && timeUpPhase === 1) {
    return (
      <div className="game-viewport-lock relative flex h-full w-full flex-col overflow-hidden text-white">
        <Background />
        <div
          className="timeup-oops-overlay"
          role="status"
          aria-live="polite"
        >
          <p className="timeup-oops-headline">Oops, let&apos;s try again</p>
        </div>
      </div>
    );
  }

  const isTimeUpRecap = outcome === "timeUp" && timeUpPhase === 2;

  return (
    <div className="game-viewport-lock relative flex h-full w-full flex-col overflow-hidden text-white">
      <Background />
      {!isTimeUpRecap && <VictoryConfetti intensity="full" />}

      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <TopHUD
          lives={lives}
          elapsedSeconds={remainingSeconds}
          isMuted={isMuted}
          mode="results"
          lowTimeThreshold={9999}
          connectedCount={Object.keys(resolvedByCard).length}
          totalCards={cards.length}
          onPauseClick={() => setIsPaused(true)}
          onMuteToggle={onMuteToggle}
        />

        <main
          className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto overflow-x-hidden px-4 pb-[180px] pt-2"
          style={{ marginTop: 0 }}
        >
          <div className="m-auto flex w-full max-w-[1200px] shrink-0 flex-col items-center justify-center gap-4 px-2 py-4">
            {isTimeUpRecap ? (
              <div className="flex w-full flex-col items-center gap-2 text-center">
                <p
                  className="success-endgame-goodjob success-endgame-headline m-0 w-full"
                  style={{ fontFamily: "var(--font-bitter), serif" }}
                >
                  Nice work
                </p>
                <p
                  className="success-endgame-subtitle success-endgame-headline m-0 w-full"
                  style={{ fontFamily: "var(--font-bitter), serif" }}
                >
                  You can try again
                </p>
              </div>
            ) : (
              <p
                className="success-endgame-headline w-full text-center font-bitter text-[clamp(26px,4vw,32px)] font-bold leading-tight text-white"
                style={{ fontFamily: "var(--font-bitter), serif" }}
              >
                You completed the game!
              </p>
            )}

            <div className="flex w-full min-h-0 flex-col items-center justify-center">
              <CardStage
                key={isTimeUpRecap ? "timeup-recap" : "victory-recap"}
                cards={cards}
                highlightedCardId={null}
                cardStatus={{}}
                resolvedByCard={resolvedByCard}
                cardFeedback={{}}
                onCardHover={() => {}}
                onCardDrop={() => {}}
                animateMount={false}
                showSlotArrow={false}
                activeOriginCardId={null}
                showConnectSlotWhenResolved={showRel}
                relationshipByCard={showRel ? relationshipByCard : {}}
                keepConnectorWhenRelationship={showBirth}
                resolvedConnectorExtraOffsetPx={showBirth ? 22 : 0}
                birthDateByCard={showBirth ? birthDateByCard : {}}
                cardContentLinesByCard={cardContentLinesByCard}
                round={finalRound}
                photosOnly={false}
                endgameSuccessPresentation
              />
            </div>
          </div>
        </main>

        <div
          className="pointer-events-auto absolute bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 flex-col items-center px-4"
          style={{ paddingBottom: "max(28px, env(safe-area-inset-bottom))" }}
        >
          {isTimeUpRecap ? (
            <GamePrimaryButton sfxVariant="click" onClick={onRestartGame}>
              Try again
            </GamePrimaryButton>
          ) : (
            <div className="success-endgame-continue-wrap">
              <GamePrimaryButton sfxVariant="reward" onClick={onPrimaryContinue}>
                Claim reward
              </GamePrimaryButton>
            </div>
          )}
        </div>
      </div>

      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            onRestartGame();
          }}
          onQuit={onClose}
        />
      )}
    </div>
  );
}
