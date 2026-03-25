import { PhotoCard, NameChip } from "@/types/game";

export const mockCards: PhotoCard[] = [
  {
    id: "card-1",
    name: "Catherine",
    imageUrl: "/assets/card-1.png",
    isHighlighted: false,
    isMatched: false,
  },
  {
    id: "card-2",
    name: "Tom",
    imageUrl: "/assets/card-2.png",
    isHighlighted: false,
    isMatched: false,
  },
  {
    id: "card-3",
    name: "Justin",
    imageUrl: "/assets/card-3.png",
    isHighlighted: false,
    isMatched: false,
  },
  {
    id: "card-4",
    name: "Ian",
    imageUrl: "/assets/card-4.png",
    isHighlighted: false,
    isMatched: false,
  },
];

export const mockChips: NameChip[] = [
  {
    id: "chip-1",
    name: "Catherine",
    isSelected: false,
    isMatched: false,
    correctCardId: "card-1",
  },
  {
    id: "chip-2",
    name: "Tom",
    isSelected: false,
    isMatched: false,
    correctCardId: "card-2",
  },
  {
    id: "chip-3",
    name: "Justin",
    isSelected: false,
    isMatched: false,
    correctCardId: "card-3",
  },
  {
    id: "chip-4",
    name: "Ian",
    isSelected: false,
    isMatched: false,
    correctCardId: "card-4",
  },
  /** Chip distractor: siempre incorrecto; no forma parte de la solución */
  {
    id: "chip-distractor-r1",
    name: "Iara",
    isSelected: false,
    isMatched: false,
    correctCardId: "__distractor__",
    isDistractor: true,
  },
];
