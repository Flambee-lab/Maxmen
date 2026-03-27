"use client";

import { useState } from "react";
import { Background } from "@/components/game/Background";
import { VictoryConfetti } from "@/components/game/VictoryConfetti";
import { CardStage } from "@/components/game/CardStage";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { PauseMenu } from "@/components/game/PauseMenu";
import { TopHUD } from "@/components/game/TopHUD";
import type { GameEndgameSnapshot } from "@/types/gameEndgameSnapshot";

export interface GameResultsRecapProps {
  snapshot: GameEndgameSnapshot;
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
  /** Siguiente paso (p. ej. video de recompensa) */
  onPrimaryContinue: () => void;
  /** Restart en pausa: nueva partida desde ronda 1 (remonta GameScreen en la página) */
  onRestartGame: () => void;
}

/**
 * Resultados post-partida: conexiones finales en las fotos (nombres / relación / fecha),
 * sin fila de chips; HUD congelado; CTA “Claim reward”.
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

  const showRel = finalRound >= 2;
  const showBirth = finalRound >= 3;
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="game-viewport-lock relative flex h-full w-full flex-col overflow-hidden text-white">
      <Background />
      <VictoryConfetti intensity="full" />

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
            <p
              className="w-full text-center font-bitter text-[clamp(26px,4vw,32px)] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-bitter), serif" }}
            >
              You completed the game!
            </p>

            <div className="flex w-full min-h-0 flex-col items-center justify-center">
              <CardStage
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
          <div className="success-endgame-continue-wrap">
            <GamePrimaryButton sfxVariant="reward" onClick={onPrimaryContinue}>
              Claim reward
            </GamePrimaryButton>
          </div>
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
