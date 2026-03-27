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
  /** Entrada al montar: slide (default) o solo fade (intro/transición antes del giro) */
  cardMountEntrance?: "slide" | "fade";
  showSlotArrow?: boolean;
  /** Card que es origen en modo card → chip; su flecha a 100%, el resto 20% */
  activeOriginCardId?: string | null;
  showConnectSlotWhenResolved?: boolean;
  relationshipByCard?: Record<string, string>;
  /** Prefijo "is my …" en la segunda línea del nametag (personas / relaciones). */
  relationshipLabelPossessive?: boolean;
  keepConnectorWhenRelationship?: boolean;
  resolvedConnectorExtraOffsetPx?: number;
  birthDateByCard?: Record<string, string>;
  /** Líneas del nametag por card (contenido acumulado por ronda / tipo de pregunta) */
  cardContentLinesByCard?: Record<string, string[]>;
  /** Solo imágenes (intro ronda 1): sin slots ni chips */
  photosOnly?: boolean;
  /** Stagger entre cartas al montar (intro/transición puede ir más lento) */
  staggerDelayMs?: number;
  /** Pantalla victoria final: entrada escalonada + brillo suave */
  endgameSuccessPresentation?: boolean;
  /** Ronda actual (1–3) para slot con contenido apilado */
  round?: 1 | 2 | 3;
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
  cardMountEntrance = "slide",
  staggerDelayMs = CARD_STAGGER_MS,
  showSlotArrow = true,
  activeOriginCardId = null,
  showConnectSlotWhenResolved = false,
  relationshipByCard = {},
  relationshipLabelPossessive = true,
  keepConnectorWhenRelationship = false,
  resolvedConnectorExtraOffsetPx = 0,
  birthDateByCard = {},
  cardContentLinesByCard = {},
  photosOnly = false,
  endgameSuccessPresentation = false,
  round,
}: CardStageProps) {
  return (
    <div
      className={`relative z-10 flex items-end justify-center gap-[20px] px-4 ${
        endgameSuccessPresentation ? "success-endgame-cards" : ""
      }`}
    >
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
          cardMountEntrance={cardMountEntrance}
          staggerDelayMs={staggerDelayMs}
          showSlotArrow={showSlotArrow}
          slotArrowOpacity={activeOriginCardId === card.id ? 1 : 0.2}
          isOriginActive={activeOriginCardId === card.id}
          showConnectSlotWhenResolved={showConnectSlotWhenResolved}
          relationshipLabel={relationshipByCard[card.id]}
          relationshipLabelPossessive={relationshipLabelPossessive}
          keepConnectorWhenRelationship={keepConnectorWhenRelationship}
          resolvedConnectorExtraOffsetPx={resolvedConnectorExtraOffsetPx}
          birthDateLabel={birthDateByCard[card.id]}
          cardContentLines={cardContentLinesByCard[card.id]}
          round={round}
          photosOnly={photosOnly}
          endgameSuccessPresentation={endgameSuccessPresentation}
        />
      ))}
    </div>
  );
}
