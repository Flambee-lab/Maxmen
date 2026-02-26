"use client";

import { GameSecondaryIconButton } from "./GameSecondaryIconButton";

interface PauseButtonProps {
  onClick: () => void;
}

const ICON_SIZE = 24;

/**
 * Botón secundario (misma familia que Back/Close): hover, pressed, focus.
 */
export function PauseButton({ onClick }: PauseButtonProps) {
  return (
    <GameSecondaryIconButton onClick={onClick} aria-label="Pause">
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
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
    </GameSecondaryIconButton>
  );
}
