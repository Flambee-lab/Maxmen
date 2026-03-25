export interface PhotoCard {
  id: string;
  name: string;
  imageUrl: string;
  isHighlighted: boolean;
  isMatched: boolean;
}

export interface NameChip {
  id: string;
  name: string;
  isSelected: boolean;
  isMatched: boolean;
  correctCardId: string;
  /** Si true: nunca es respuesta correcta; solo distrae (se quita al terminar la ronda) */
  isDistractor?: boolean;
}

export interface DragState {
  isDragging: boolean;
  chipId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface GameState {
  round: number;
  lives: number;
  isPaused: boolean;
  isMuted: boolean;
  selectedCardId: string | null;
  selectedChipId: string | null;
  hoveredNameId: string | null;
  draggingNameId: string | null;
  dragState: DragState | null;
  cards: PhotoCard[];
  chips: NameChip[];
  connections: Array<{ nameId: string; cardId: string }>;
  showSuccess: boolean;
  /** Si showSuccess es por tiempo agotado (time's up) en lugar de victoria */
  successReason?: "victory" | "timeUp";
}
