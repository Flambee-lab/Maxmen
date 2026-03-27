"use client";

import type { CSSProperties } from "react";
import { PhotoCard as PhotoCardType } from "@/types/game";
import { GameCard } from "./GameCard";

interface PhotoCardProps {
  card: PhotoCardType;
  index?: number;
  isHighlighted: boolean;
  cardStatus?: "correct" | "incorrect" | "idle";
  resolvedChipName?: string; // Nombre del chip resuelto en esta card
  cardFeedback?: "idle" | "incorrect" | "correct"; // Feedback temporal
  onHover: () => void;
  onHoverLeave: () => void;
  onDrop: () => void;
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
  animateMount?: boolean;
  cardMountEntrance?: "slide" | "fade";
  staggerDelayMs?: number;
  showSlotArrow?: boolean;
  slotArrowOpacity?: number;
  isOriginActive?: boolean;
  showConnectSlotWhenResolved?: boolean;
  relationshipLabel?: string;
  relationshipLabelPossessive?: boolean;
  keepConnectorWhenRelationship?: boolean;
  resolvedConnectorExtraOffsetPx?: number;
  birthDateLabel?: string;
  cardContentLines?: string[];
  round?: 1 | 2 | 3;
  photosOnly?: boolean;
  endgameSuccessPresentation?: boolean;
}

export function PhotoCardComponent({
  card,
  index = 0,
  isHighlighted,
  cardStatus = "idle",
  resolvedChipName,
  cardFeedback = "idle",
  onHover,
  onHoverLeave,
  onDrop,
  connectSlotRef,
  animateMount = false,
  cardMountEntrance = "slide",
  staggerDelayMs = 80,
  showSlotArrow = true,
  slotArrowOpacity = 0.2,
  isOriginActive = false,
  showConnectSlotWhenResolved = false,
  relationshipLabel,
  relationshipLabelPossessive = true,
  keepConnectorWhenRelationship = false,
  resolvedConnectorExtraOffsetPx = 0,
  birthDateLabel,
  cardContentLines,
  round,
  photosOnly = false,
  endgameSuccessPresentation = false,
}: PhotoCardProps) {
  const isResolved = !!resolvedChipName;
  // Solo mostrar highlight si no está resuelta y no está en feedback incorrecto
  const showHighlight = isHighlighted && !isResolved && cardFeedback !== "incorrect";

  const enterStyle = animateMount
    ? { animationDelay: `${index * staggerDelayMs}ms` }
    : undefined;

  const mountEnterClass =
    animateMount && cardMountEntrance === "fade"
      ? "game-card-enter-fade"
      : animateMount
        ? "game-card-enter"
        : "";

  const spinDelayMs =
    animateMount && cardMountEntrance === "fade"
      ? index * staggerDelayMs
      : undefined;

  const shellStyle: CSSProperties = {
    ...(showHighlight
      ? {
          filter: "drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.40))",
          outline: "1px solid #FFFFFF",
          outlineOffset: "-1px",
          borderRadius: "16px",
        }
      : {}),
    ...(spinDelayMs !== undefined
      ? { animationDelay: `${spinDelayMs}ms` }
      : {}),
  };

  return (
    <div
      className={`flex flex-col items-center ${mountEnterClass} game-card-hover-scale ${showHighlight ? "game-card-highlighted" : ""} ${
        endgameSuccessPresentation ? "success-endgame-card-enter" : ""
      }`}
      style={enterStyle}
      data-target-id={card.id}
    >
      <div
        onMouseEnter={onHover}
        onMouseLeave={onHoverLeave}
        onFocus={onHover}
        onBlur={onHoverLeave}
        onClick={onDrop}
        data-target-id={card.id}
        tabIndex={0}
        role="button"
        aria-label={`Card ${card.name}`}
        className={`game-focus-visible game-card-shell ${
          endgameSuccessPresentation ? "success-endgame-card-shell" : ""
        }`}
        style={Object.keys(shellStyle).length ? shellStyle : undefined}
      >
        <GameCard
          imageSrc={card.imageUrl}
          alt={card.name}
          cardId={card.id}
          cardStatus={cardStatus}
          resolvedChipName={resolvedChipName}
          cardFeedback={cardFeedback}
          connectSlotRef={connectSlotRef}
          showSlotArrow={showSlotArrow}
          slotArrowOpacity={slotArrowOpacity}
          isOriginActive={isOriginActive}
          showConnectSlotWhenResolved={showConnectSlotWhenResolved}
          relationshipLabel={relationshipLabel}
          relationshipLabelPossessive={relationshipLabelPossessive}
          keepConnectorWhenRelationship={keepConnectorWhenRelationship}
          resolvedConnectorExtraOffsetPx={resolvedConnectorExtraOffsetPx}
          birthDateLabel={birthDateLabel}
          cardContentLines={cardContentLines}
          round={round}
          photosOnly={photosOnly}
          hideConnectSlot={endgameSuccessPresentation}
        />
      </div>
    </div>
  );
}
