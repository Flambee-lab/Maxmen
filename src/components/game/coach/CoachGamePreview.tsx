"use client";

import { Background } from "@/components/game/Background";
import { TopHUD } from "@/components/game/TopHUD";
import { GameInstruction } from "@/components/game/GameInstruction";
import { CardStage } from "@/components/game/CardStage";
import { ChipRow } from "@/components/game/ChipRow";
import { RevealAnswersButton } from "@/components/game/RevealAnswersButton";
import { mockCards, mockChips } from "@/mocks/gameMocks";

/** Preview del juego completo para Coach: 3 cards, N-1 chips. Sin lógica, solo visual. */
const COACH_CARDS = mockCards.slice(0, 3);
const COACH_CHIPS = mockChips.slice(0, -1);

interface CoachGamePreviewProps {
  /** Si true, no renderiza Background (lo provee la página) */
  skipBackground?: boolean;
  /** Si true, oculta el título del juego (solo para Coach) */
  hideTitle?: boolean;
}

/**
 * Preview completo del juego para CoachScreen: mismo UI que stage="play" pero con 3 cards y N-1 chips.
 * Todo queda detrás del overlay; solo las cards se revelan mediante spotlight window.
 */
export function CoachGamePreview({ skipBackground = true, hideTitle = false }: CoachGamePreviewProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {!skipBackground && <Background />}

      <div className="relative z-10 min-h-screen">
        <TopHUD
          lives={5}
          elapsedSeconds={0}
          isMuted={false}
          onPauseClick={() => {}}
          onMuteToggle={() => {}}
        />

        <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
          {!hideTitle && <GameInstruction />}
          <div className="coach-cards-container" style={{ marginTop: hideTitle ? "0px" : "58px" }}>
            <CardStage
              cards={COACH_CARDS}
              highlightedCardId={null}
              onCardHover={() => {}}
              onCardDrop={() => {}}
            />
          </div>

          <div style={{ marginTop: "78px" }}>
            <ChipRow
              chips={COACH_CHIPS}
              hoveredNameId={null}
              draggingNameId={null}
              selectedChipId={null}
              onChipHover={() => {}}
              onChipClick={() => {}}
            />
          </div>
        </main>
      </div>

      <div
        className="absolute left-1/2"
        style={{ bottom: 0, transform: "translateX(-50%)" }}
      >
        <RevealAnswersButton onClick={() => {}} />
      </div>
    </div>
  );
}
