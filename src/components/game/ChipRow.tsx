"use client";

import { NameChip } from "@/types/game";
import { Chip } from "./Chip";

interface ChipRowProps {
  chips: NameChip[];
  hoveredNameId: string | null;
  draggingNameId: string | null;
  onChipHover: (nameId: string | null) => void;
  onArrowPointerDown: (nameId: string, e: React.PointerEvent) => void;
  chipRef?: (nameId: string, element: HTMLDivElement | null) => void;
}

export function ChipRow({
  chips,
  hoveredNameId,
  draggingNameId,
  onChipHover,
  onArrowPointerDown,
  chipRef,
}: ChipRowProps) {
  return (
    <div className="relative z-10 flex items-center justify-center gap-[16px]">
      {chips.map((chip) => (
        <div key={chip.id} className="game-chip-enter">
          <Chip
            label={chip.name}
            nameId={chip.id}
            arrowHeight={32}
            isHovered={chip.id === hoveredNameId}
            isDragging={chip.id === draggingNameId}
            onArrowPointerDown={(e) => onArrowPointerDown(chip.id, e)}
            onMouseEnter={() => onChipHover(chip.id)}
            onMouseLeave={() => onChipHover(null)}
            chipRef={chipRef}
          />
        </div>
      ))}
    </div>
  );
}
