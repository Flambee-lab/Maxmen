"use client";

import { useRef, useState } from "react";

import { CoachGamePreview, COACH_CARDS, COACH_PREVIEW_CHIPS } from "@/components/game/coach/CoachGamePreview";
import {
  COACH_CARD_STAGE_HEIGHT_PX,
  COACH_CARD_STAGE_TOP_PX,
  COACH_CHIP_SPOTLIGHT_HEIGHT_PX,
  COACH_CHIP_SPOTLIGHT_TOP_PX,
  COACH_CHIP_SPOTLIGHT_WIDTH_PX,
  COACH_CONNECT_CHIP_CENTER_OFFSET_FROM_VIEWPORT_CENTER_PX,
  COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX,
  COACH_CARD_WIDTH_PX,
  COACH_MIDDLE_CARD_LEFT_OFFSET_PX,
  COACH_LIVES_ROW_HEIGHT_PX,
  COACH_LIVES_ROW_WIDTH_PX,
  COACH_PAUSE_BUTTON_SIZE_PX,
  COACH_SPOTLIGHT_FOCUS_PADDING_PX,
  COACH_SPOTLIGHT_RADIUS_PX,
  COACH_SPOTLIGHT_WIDTH_PX,
} from "@/components/game/coach/coachLayout";
import { CoachVeloOverlay, useCoachSpotlightMask } from "@/components/game/coach/CoachVeloOverlay";
import { COACH_STEP_COUNT, COACH_STEPS } from "@/components/game/coach/coachSteps";
import { CardStage } from "@/components/game/CardStage";
import { ChipRow } from "@/components/game/ChipRow";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";

interface CoachScreenProps {
  onContinue: () => void;
}

/**
 * CoachScreen: tablero detrás de un velo degradado; spotlight encima del velo (cards, chips, Connect, etc.).
 * Connect: solo marcos de iluminación; cards y chips vienen del preview (misma fila y altura).
 */
export function CoachScreen({ onContinue }: CoachScreenProps) {
  const coachRef = useRef<HTMLDivElement>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const step = COACH_STEPS[stepIndex];
  const isLastStep = stepIndex >= COACH_STEP_COUNT - 1;
  const focus = step.focus ?? "cards";
  const spotlightIsCards = focus === "cards";
  const spotlightIsChips = focus === "chips";
  const spotlightIsConnect = focus === "connect";
  const spotlightIsLightbulbs = focus === "lightbulbs";
  const spotlightIsPauseButton = focus === "pauseButton";
  const focusPad = COACH_SPOTLIGHT_FOCUS_PADDING_PX;
  const focusPad2 = focusPad * 2;

  const spotlightMaskStyle = useCoachSpotlightMask(coachRef, `${stepIndex}-${focus}`);

  const handleNext = () => {
    if (isLastStep) {
      onContinue();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  };

  /** Cartel: misma esquina inferior derecha en todos los pasos */
  const popupPositionStyle = {
    bottom: "40px",
    top: "auto" as const,
    right: "24px",
    left: "auto" as const,
    transform: "none" as const,
  };

  return (
    <div
      ref={coachRef}
      className="coach-screen relative isolate w-full min-h-screen"
    >
      {/* Layer 1: preview; misma máscara que el velo → en el foco no tapa el Background real */}
      <div
        className="pointer-events-none select-none absolute inset-0"
        style={{ zIndex: 1, ...spotlightMaskStyle }}
      >
        <CoachGamePreview
          skipBackground
          hideTitle
          omitCardStage={spotlightIsCards}
          omitChips={spotlightIsChips}
        />
      </div>

      {/* Layer 2: velo degradado con la misma máscara */}
      <CoachVeloOverlay maskStyle={spotlightMaskStyle} />

      {/* Layer 3: spotlight — cards o chips (encima del velo; el preview usa placeholder para no duplicar) */}
      {spotlightIsCards ? (
        <div
          key={`coach-spotlight-cards-${stepIndex}`}
          className="coach-spotlight-frame absolute pointer-events-none"
          data-coach-overlay-hole
          style={{
            top: `${COACH_CARD_STAGE_TOP_PX - focusPad}px`,
            left: "50%",
            marginLeft: `-${(COACH_SPOTLIGHT_WIDTH_PX + focusPad2) / 2}px`,
            width: `${COACH_SPOTLIGHT_WIDTH_PX + focusPad2}px`,
            maxWidth: `min(92vw, ${COACH_SPOTLIGHT_WIDTH_PX + focusPad2}px)`,
            height: `${COACH_CARD_STAGE_HEIGHT_PX + focusPad2}px`,
            borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
            zIndex: 3,
          }}
        >
          <div className="coach-spotlight-frame__clip">
            <CardStage
              cards={COACH_CARDS}
              highlightedCardId={null}
              onCardHover={() => {}}
              onCardDrop={() => {}}
            />
          </div>
        </div>
      ) : null}
      {spotlightIsChips ? (
        <div
          key={`coach-spotlight-chips-${stepIndex}`}
          className="coach-spotlight-frame absolute pointer-events-none"
          data-coach-overlay-hole
          style={{
            top: `${COACH_CHIP_SPOTLIGHT_TOP_PX - focusPad}px`,
            left: "50%",
            marginLeft: `-${(COACH_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2) / 2}px`,
            width: `${COACH_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2}px`,
            maxWidth: `min(92vw, ${COACH_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2}px)`,
            height: `${COACH_CHIP_SPOTLIGHT_HEIGHT_PX + focusPad2}px`,
            borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
            zIndex: 3,
          }}
        >
          <div className="coach-spotlight-frame__clip flex items-center justify-center">
            <ChipRow
              chips={COACH_PREVIEW_CHIPS}
              hoveredNameId={null}
              draggingNameId={null}
              selectedChipId={null}
              onChipHover={() => {}}
              onChipClick={() => {}}
            />
          </div>
        </div>
      ) : null}
      {spotlightIsConnect ? (
        <>
          <div
            key={`coach-spotlight-connect-card-${stepIndex}`}
            className="coach-spotlight-frame absolute pointer-events-none"
            data-coach-overlay-hole
            aria-hidden
            style={{
              top: `${COACH_CARD_STAGE_TOP_PX - focusPad}px`,
              left: `calc(50% - ${COACH_SPOTLIGHT_WIDTH_PX / 2}px + ${COACH_MIDDLE_CARD_LEFT_OFFSET_PX}px - ${focusPad}px)`,
              width: `${COACH_CARD_WIDTH_PX + focusPad2}px`,
              maxWidth: "92vw",
              height: `${COACH_CARD_STAGE_HEIGHT_PX + focusPad2}px`,
              borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
              zIndex: 3,
            }}
          />
          <div
            key={`coach-spotlight-connect-chip-${stepIndex}`}
            className="coach-spotlight-frame absolute pointer-events-none"
            data-coach-overlay-hole
            aria-hidden
            style={{
              top: `${COACH_CHIP_SPOTLIGHT_TOP_PX - focusPad}px`,
              left: `calc(50% + ${COACH_CONNECT_CHIP_CENTER_OFFSET_FROM_VIEWPORT_CENTER_PX}px - ${(COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2) / 2}px)`,
              width: `${COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX + focusPad2}px`,
              maxWidth: "92vw",
              height: `${COACH_CHIP_SPOTLIGHT_HEIGHT_PX + focusPad2}px`,
              borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
              zIndex: 3,
            }}
          />
        </>
      ) : null}
      {spotlightIsLightbulbs ? (
        <div
          key={`coach-spotlight-lives-${stepIndex}`}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 3 }}
        >
          {/* Misma caja que TopHUD: el marco coincide con las bombillas sin moverlas */}
          <div className="relative z-10 flex w-full items-center py-4 px-6">
            <div className="absolute left-6">
              <div
                aria-hidden
                className="coach-spotlight-frame"
                data-coach-overlay-hole
                style={{
                  width: `${COACH_LIVES_ROW_WIDTH_PX + focusPad2}px`,
                  height: `${COACH_LIVES_ROW_HEIGHT_PX + focusPad2}px`,
                  borderRadius: `${COACH_SPOTLIGHT_RADIUS_PX + 4}px`,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
      {spotlightIsPauseButton ? (
        <div
          key={`coach-spotlight-pause-${stepIndex}`}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 3 }}
        >
          <div className="relative z-10 flex w-full items-center py-4 px-6">
            <div className="absolute right-6">
              <div
                className="flex items-center"
                style={{ gap: "12px" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none shrink-0"
                  style={{
                    width: `${COACH_PAUSE_BUTTON_SIZE_PX}px`,
                    height: `${COACH_PAUSE_BUTTON_SIZE_PX}px`,
                  }}
                />
                <div
                  aria-hidden
                  className="coach-spotlight-frame"
                  data-coach-overlay-hole
                  style={{
                    width: `${COACH_PAUSE_BUTTON_SIZE_PX + focusPad2}px`,
                    height: `${COACH_PAUSE_BUTTON_SIZE_PX + focusPad2}px`,
                    borderRadius: "36px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Layer 4: Coach header */}
      <div
        className="absolute left-0 right-0 top-0 pt-12 text-center pointer-events-none"
        style={{
          fontFamily: "var(--font-bitter), serif",
          zIndex: 4,
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: "32px",
            color: "#FFFFFF",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          Remind Game
        </h1>
        <p
          style={{
            fontWeight: 500,
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.85)",
            margin: 0,
          }}
        >
          Instructions
        </p>
      </div>

      {/* Layer 4: popup */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "min(340px, 85vw)",
          zIndex: 4,
          overflow: "visible",
          ...popupPositionStyle,
        }}
      >
        <div className="relative w-full" style={{ overflow: "visible" }}>
          <div
            className="pointer-events-auto"
            style={{
              position: "relative",
              /* Pasos Read/Connect: cartel arriba de chips; texto largo sin esto sube y recorta título/subtítulo */
              maxHeight: "min(58vh, 520px)",
              overflowY: "auto",
              borderRadius: "24px",
              background: "rgba(30, 44, 81, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              fontFamily: "var(--font-bitter), serif",
            }}
          >
            <div className="px-6 py-5">
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#FFFFFF",
                  margin: 0,
                  marginBottom: step.subtitle ? "8px" : "12px",
                }}
              >
                {step.title}
              </p>
              {step.subtitle ? (
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.85)",
                    lineHeight: 1.4,
                    margin: 0,
                    marginBottom: step.body ? "12px" : "16px",
                  }}
                >
                  {step.subtitle}
                </p>
              ) : null}
              {step.body ? (
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: 1.4,
                    margin: 0,
                    marginBottom: "16px",
                  }}
                >
                  {step.body}
                </p>
              ) : null}
              <p
                style={{
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.75)",
                  margin: 0,
                  marginBottom: "20px",
                }}
              >
                {stepIndex + 1} of {COACH_STEP_COUNT}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {stepIndex === 0 ? (
                  <button
                    type="button"
                    onClick={onContinue}
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "rgba(255, 255, 255, 0.9)",
                      background: "transparent",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      borderRadius: "24px",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                  >
                    Skip
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontWeight: 600,
                      fontSize: "18px",
                      color: "rgba(255, 255, 255, 0.9)",
                      background: "transparent",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      borderRadius: "24px",
                      padding: "12px 24px",
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                )}
                <GamePrimaryButton
                  onClick={handleNext}
                  style={{
                    width: "auto",
                    minWidth: "140px",
                    height: "52px",
                    fontSize: "18px",
                  }}
                >
                  Next
                </GamePrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
