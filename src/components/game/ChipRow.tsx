"use client";

import { NameChip } from "@/types/game";
import { Chip } from "./Chip";

interface ChipRowProps {
  chips: NameChip[];
  hoveredNameId: string | null;
  draggingNameId: string | null;
  selectedChipId?: string | null;
  onChipHover: (nameId: string | null) => void;
  onChipClick: (nameId: string) => void;
  chipRef?: (nameId: string, element: HTMLDivElement | null) => void;
  /** Cuando true (modo card → chip activo), se ocultan las flechas encima de los chips */
  hideChipArrows?: boolean;
  /** Chip actualmente activo (modo chip → card); su flecha se dibuja en overlay; el resto usa arrowOpacity */
  activeChipId?: string | null;
}

export function ChipRow({
  chips,
  hoveredNameId,
  draggingNameId,
  selectedChipId = null,
  onChipHover,
  onChipClick,
  chipRef,
  hideChipArrows = false,
  activeChipId = null,
}: ChipRowProps) {
  return (
    <div className="relative z-10 flex items-center justify-center gap-[16px]">
      {chips.map((chip, idx) => (
        <div
          key={chip.id}
          className="game-chip-enter"
          // Stagger escalonado: entra 1 por 1 como una escalera
          style={{ animationDelay: `${idx * 170}ms` }}
        >
          <Chip
            label={chip.name}
            nameId={chip.id}
            arrowHeight={32}
            isHovered={chip.id === hoveredNameId}
            isDragging={chip.id === draggingNameId}
            isSelected={chip.id === selectedChipId}
            hideRestArrow={hideChipArrows}
            arrowOpacity={activeChipId === chip.id ? 1 : 0.2}
            onClick={() => onChipClick(chip.id)}
            onMouseEnter={() => onChipHover(chip.id)}
            onMouseLeave={() => onChipHover(null)}
            chipRef={chipRef}
          />
        </div>
      ))}
    </div>
  );
}
