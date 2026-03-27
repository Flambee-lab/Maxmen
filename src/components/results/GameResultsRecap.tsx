"use client";

import { useState } from "react";
import { Background } from "@/components/game/Background";
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
          className="relative flex min-h-0 flex-1 flex-col items-center overflow-hidden px-4 pb-[180px] pt-2"
          style={{ marginTop: 0 }}
        >
          <div className="flex w-full max-w-[1200px] shrink-0 items-center justify-center px-2 pb-5 pt-1">
            <p
              className="w-full text-center font-bitter text-[clamp(22px,4vw,28px)] font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-bitter), serif" }}
            >
              You completed the game!
            </p>
          </div>

          <div className="flex w-full max-w-[1200px] min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
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
