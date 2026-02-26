"use client";

import { GameSecondaryIconButton } from "./GameSecondaryIconButton";

interface CloseButtonProps {
  onClick: () => void;
}

const ICON_SIZE = 24;

/**
 * Botón secundario (misma familia que Back/Pause): hover, pressed, focus.
 */
export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <GameSecondaryIconButton onClick={onClick} aria-label="Close">
      <svg
        width={ICON_SIZE}
        height={ICON_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </GameSecondaryIconButton>
  );
}
