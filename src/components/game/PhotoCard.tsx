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
    <div className="flex flex-col items-center">
      <div
        className={isHighlighted ? "card-highlight transition-all duration-300" : ""}
        onMouseEnter={onHover}
        onMouseLeave={onHoverLeave}
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
