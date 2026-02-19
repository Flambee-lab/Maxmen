"use client";

import { PhotoCard as PhotoCardType } from "@/types/game";
import { GameCard } from "./GameCard";

interface PhotoCardProps {
  card: PhotoCardType;
  isHighlighted: boolean;
  cardStatus?: "correct" | "incorrect" | "idle";
  resolvedChipName?: string; // Nombre del chip resuelto en esta card
  cardFeedback?: "idle" | "incorrect" | "correct"; // Feedback temporal
  onHover: () => void;
  onHoverLeave: () => void;
  onDrop: () => void;
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
}

export function PhotoCardComponent({
  card,
  isHighlighted,
  cardStatus = "idle",
  resolvedChipName,
  cardFeedback = "idle",
  onHover,
  onHoverLeave,
  onDrop,
  connectSlotRef,
}: PhotoCardProps) {
  const isResolved = !!resolvedChipName;
  // Solo mostrar highlight si no está resuelta y no está en feedback incorrecto
  const showHighlight = isHighlighted && !isResolved && cardFeedback !== "incorrect";

  return (
    <div className="flex flex-col items-center" data-target-id={card.id}>
      <div
        onMouseEnter={onHover}
        onMouseLeave={onHoverLeave}
        data-target-id={card.id}
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
