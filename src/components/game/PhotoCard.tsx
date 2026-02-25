"use client";

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
  staggerDelayMs?: number;
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
  staggerDelayMs = 80,
}: PhotoCardProps) {
  const isResolved = !!resolvedChipName;
  // Solo mostrar highlight si no está resuelta y no está en feedback incorrecto
  const showHighlight = isHighlighted && !isResolved && cardFeedback !== "incorrect";

  const enterStyle = animateMount
    ? { animationDelay: `${index * staggerDelayMs}ms` }
    : undefined;

  return (
    <div
      className={`flex flex-col items-center ${animateMount ? "game-card-enter" : ""} game-card-hover-scale ${showHighlight ? "game-card-highlighted" : ""}`}
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
        className="game-focus-visible game-card-shell"
        style={
          showHighlight
            ? {
                filter: "drop-shadow(0px 0px 15px rgba(0, 0, 0, 0.40))",
                outline: "1px solid #FFFFFF",
                outlineOffset: "-1px",
                borderRadius: "16px",
              }
            : undefined
        }
      >
        <GameCard
          imageSrc={card.imageUrl}
          alt={card.name}
          cardId={card.id}
          cardStatus={cardStatus}
          resolvedChipName={resolvedChipName}
          cardFeedback={cardFeedback}
          connectSlotRef={connectSlotRef}
        />
      </div>
    </div>
  );
}
