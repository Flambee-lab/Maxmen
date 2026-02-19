"use client";

import Image from "next/image";

interface GameCardProps {
  imageSrc: string;
  alt?: string;
  cardId: string;
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
}

const CARD_SIZE = 208;
const CARD_RADIUS = 16;
const CONNECT_SLOT_SIZE = 48;
const INNER_CIRCLE_SIZE = 28;
const INNER_CIRCLE_BORDER = 2;

export function GameCard({
  imageSrc,
  alt = "Card",
  cardId,
  connectSlotRef,
}: GameCardProps) {
  return (
    <div
      className="relative"
      style={{
        width: `${CARD_SIZE}px`,
        height: `${CARD_SIZE}px`,
      }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={CARD_SIZE}
        height={CARD_SIZE}
        style={{
          width: `${CARD_SIZE}px`,
          height: `${CARD_SIZE}px`,
          borderRadius: `${CARD_RADIUS}px`,
          objectFit: "cover",
          display: "block",
        }}
      />

      <div
        ref={(el) => {
          if (connectSlotRef) {
            connectSlotRef(cardId, el);
          }
        }}
        data-card-id={cardId}
        data-target-id={cardId}
        className="absolute"
        style={{
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%) translateY(50%)",
          width: `${CONNECT_SLOT_SIZE}px`,
          height: `${CONNECT_SLOT_SIZE}px`,
          borderRadius: "9999px",
          backgroundColor: "#284B79",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: `${INNER_CIRCLE_SIZE}px`,
            height: `${INNER_CIRCLE_SIZE}px`,
            borderRadius: "9999px",
            backgroundColor: "rgba(255, 255, 255, 0.20)",
            border: `${INNER_CIRCLE_BORDER}px solid #FFFFFF`,
          }}
        />
      </div>
    </div>
  );
}
