"use client";

import { PhotoCard } from "@/types/game";
import { PhotoCardComponent } from "./PhotoCard";

interface CardStageProps {
  cards: PhotoCard[];
  highlightedCardId: string | null;
  cardStatus?: Record<string, "correct" | "incorrect" | "idle">;
  resolvedByCard?: Record<string, string>; // cardId -> chipName
  cardFeedback?: Record<string, "idle" | "incorrect" | "correct">;
  onCardHover: (cardId: string | null) => void;
  onCardDrop: (cardId: string) => void;
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
  animateMount?: boolean;
}

const CARD_STAGGER_MS = 80;

export function CardStage({
  cards,
  highlightedCardId,
  cardStatus = {},
  resolvedByCard = {},
  cardFeedback = {},
  onCardHover,
  onCardDrop,
  connectSlotRef,
  animateMount = false,
}: CardStageProps) {
  return (
    <div className="relative z-10 flex items-end justify-center gap-[20px] px-4">
      {cards.map((card, index) => (
        <PhotoCardComponent
          key={card.id}
          card={card}
          index={index}
          isHighlighted={card.id === highlightedCardId}
          cardStatus={cardStatus[card.id]}
          resolvedChipName={resolvedByCard[card.id]}
          cardFeedback={cardFeedback[card.id]}
          onHover={() => onCardHover(card.id)}
          onHoverLeave={() => onCardHover(null)}
          onDrop={() => onCardDrop(card.id)}
          connectSlotRef={connectSlotRef}
          animateMount={animateMount}
          staggerDelayMs={CARD_STAGGER_MS}
        />
      ))}
    </div>
  );
}
