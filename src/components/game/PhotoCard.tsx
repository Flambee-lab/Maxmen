"use client";

import { PhotoCard as PhotoCardType } from "@/types/game";
import { GameCard } from "./GameCard";

interface PhotoCardProps {
  card: PhotoCardType;
  isHighlighted: boolean;
  onHover: () => void;
  onHoverLeave: () => void;
  onDrop: () => void;
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
}

export function PhotoCardComponent({
  card,
  isHighlighted,
  onHover,
  onHoverLeave,
  onDrop,
  connectSlotRef,
}: PhotoCardProps) {
  return (
    <div className="flex flex-col items-center" data-target-id={card.id}>
      <div
        onMouseEnter={onHover}
        onMouseLeave={onHoverLeave}
        data-target-id={card.id}
        style={
          isHighlighted
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
          connectSlotRef={connectSlotRef}
        />
      </div>
    </div>
  );
}
