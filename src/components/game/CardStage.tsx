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
  showSlotArrow?: boolean;
  /** Card que es origen en modo card → chip; su flecha a 100%, el resto 20% */
  activeOriginCardId?: string | null;
  showConnectSlotWhenResolved?: boolean;
  relationshipByCard?: Record<string, string>;
  keepConnectorWhenRelationship?: boolean;
  resolvedConnectorExtraOffsetPx?: number;
  birthDateByCard?: Record<string, string>;
  /** Solo imágenes (intro ronda 1): sin slots ni chips */
  photosOnly?: boolean;
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
  showSlotArrow = true,
  activeOriginCardId = null,
  showConnectSlotWhenResolved = false,
  relationshipByCard = {},
  keepConnectorWhenRelationship = false,
  resolvedConnectorExtraOffsetPx = 0,
  birthDateByCard = {},
  photosOnly = false,
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
          showSlotArrow={showSlotArrow}
          slotArrowOpacity={activeOriginCardId === card.id ? 1 : 0.2}
          isOriginActive={activeOriginCardId === card.id}
          showConnectSlotWhenResolved={showConnectSlotWhenResolved}
          relationshipLabel={relationshipByCard[card.id]}
          keepConnectorWhenRelationship={keepConnectorWhenRelationship}
          resolvedConnectorExtraOffsetPx={resolvedConnectorExtraOffsetPx}
          birthDateLabel={birthDateByCard[card.id]}
          photosOnly={photosOnly}
        />
      ))}
    </div>
  );
}
