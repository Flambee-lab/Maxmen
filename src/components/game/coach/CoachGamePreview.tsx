"use client";

import { Background } from "@/components/game/Background";
import { TopHUD } from "@/components/game/TopHUD";
import { GameInstruction } from "@/components/game/GameInstruction";
import {
  COACH_CARD_STAGE_HEIGHT_PX,
  COACH_CHIP_ROW_PLACEHOLDER_HEIGHT_PX,
  COACH_LAYOUT,
  COACH_SPOTLIGHT_WIDTH_PX,
} from "@/components/game/coach/coachLayout";
import { CardStage } from "@/components/game/CardStage";
import { ChipRow } from "@/components/game/ChipRow";
import { mockCards, mockChips } from "@/mocks/gameMocks";

/** Preview del juego completo para Coach: 3 cards, N-1 chips. Sin lógica, solo visual. */
export const COACH_CARDS = mockCards.slice(0, 3);
/** Excluye el chip distractor “Iara” (último en mockChips) */
export const COACH_PREVIEW_CHIPS = mockChips.slice(0, -1);
const COACH_CHIPS = COACH_PREVIEW_CHIPS;

interface CoachGamePreviewProps {
  /** Si true, no renderiza Background (lo provee la página) */
  skipBackground?: boolean;
  /** Si true, oculta el título del juego (solo para Coach) */
  hideTitle?: boolean;
  /**
   * Si true, no renderiza ChipRow (el coach muestra los chips solo en el spotlight — sin duplicar).
   * Se deja un placeholder de la misma altura para no mover el layout.
   */
  omitChips?: boolean;
  /**
   * Si true, no renderiza CardStage (el coach pinta las cards solo en el spotlight — sin duplicar).
   * Placeholder con el mismo tamaño para no mover el layout.
   */
  omitCardStage?: boolean;
}

/**
 * Preview completo del juego para CoachScreen: mismo UI que stage="play" pero con 3 cards y N-1 chips.
 * Todo queda detrás del overlay; las fotos y el HUD se ven atenuados como el resto.
 * Pasos cards/chips (fila completa): highlight vía spotlight en CoachScreen (omitCardStage / omitChips).
 * Connect: el preview sigue mostrando todas las cards y chips (atenuados); la carta/chip del foco se duplica en CoachScreen encima del velo.
 */
export function CoachGamePreview({
  skipBackground = true,
  hideTitle = false,
  omitChips = false,
  omitCardStage = false,
}: CoachGamePreviewProps) {
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
          coachLivesTarget
        />

        <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
          {/* Mismo stack que GameScreen (play): instrucción + 32px + CardStage; si hideTitle, placeholder invisible para misma altura */}
          {hideTitle ? (
            <div
              aria-hidden
              className="invisible pointer-events-none w-full max-w-[min(100%,1200px)] flex justify-center"
            >
              <GameInstruction />
            </div>
          ) : (
            <GameInstruction />
          )}
          {omitCardStage ? (
            <div
              aria-hidden
              className="coach-cards-container pointer-events-none mx-auto flex justify-center"
              style={{
                marginTop: `${COACH_LAYOUT.canvasMarginTopPx}px`,
                width: `${COACH_SPOTLIGHT_WIDTH_PX}px`,
                maxWidth: "100%",
                minHeight: `${COACH_CARD_STAGE_HEIGHT_PX}px`,
              }}
            />
          ) : (
            <div className="coach-cards-container" style={{ marginTop: `${COACH_LAYOUT.canvasMarginTopPx}px` }}>
              <CardStage
                cards={COACH_CARDS}
                highlightedCardId={null}
                onCardHover={() => {}}
                onCardDrop={() => {}}
              />
            </div>
          )}

          <div style={{ marginTop: "160px" }}>
            {omitChips ? (
              <div
                aria-hidden
                className="pointer-events-none mx-auto"
                style={{
                  height: `${COACH_CHIP_ROW_PLACEHOLDER_HEIGHT_PX}px`,
                  maxWidth: "100%",
                }}
              />
            ) : (
              <ChipRow
                chips={COACH_CHIPS}
                hoveredNameId={null}
                draggingNameId={null}
                selectedChipId={null}
                onChipHover={() => {}}
                onChipClick={() => {}}
                coachTargetChipId="chip-2"
              />
            )}
          </div>
        </main>
      </div>

    </div>
  );
}
