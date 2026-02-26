"use client";

import { GameSecondaryIconButton } from "./GameSecondaryIconButton";

interface BackButtonProps {
  onClick: () => void;
}

const ICON_SIZE = 24;

/**
 * Botón secundario (misma familia que Close/Pause): hover, pressed, focus.
 */
export function BackButton({ onClick }: BackButtonProps) {
  return (
    <GameSecondaryIconButton onClick={onClick} aria-label="Back">
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
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </GameSecondaryIconButton>
  );
}
