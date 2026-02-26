"use client";

import React, { useState } from "react";

interface GameSecondaryIconButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  "aria-label": string;
}

const BUTTON_SIZE = 60;

const SECONDARY_BASE_BG =
  "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.15) 42.3%)";
const SECONDARY_HOVER_BG =
  "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.22) 42.3%)";
const SECONDARY_PRESSED_BG =
  "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.08) 42.3%)";

const SECONDARY_BASE_SHADOW =
  "0 42px 32.4px 0 rgba(0, 0, 0, 0.10), 0 -14px 14.2px 0 rgba(255, 255, 255, 0.10) inset";
const SECONDARY_PRESSED_SHADOW =
  "0 24px 24px 0 rgba(0, 0, 0, 0.18), 0 -8px 10px 0 rgba(255, 255, 255, 0.06) inset";

/**
 * Botón secundario (glass/blanco): mismos estados hover/pressed/focus que el primario.
 * Usado por BackButton, CloseButton, PauseButton.
 */
export function GameSecondaryIconButton({
  children,
  onClick,
  "aria-label": ariaLabel,
}: GameSecondaryIconButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const background = isPressed
    ? SECONDARY_PRESSED_BG
    : isHovered
    ? SECONDARY_HOVER_BG
    : SECONDARY_BASE_BG;

  const boxShadow = isPressed ? SECONDARY_PRESSED_SHADOW : SECONDARY_BASE_SHADOW;
  const transform = isPressed ? "translateY(1px)" : "translateY(0)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="game-focus-visible"
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        setIsPressed(true);
      }}
      onMouseUp={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") setIsPressed(true);
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") setIsPressed(false);
      }}
      style={{
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        borderRadius: "32px",
        border: "2px solid #FFF",
        background: background,
        boxShadow,
        transform,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition:
          "background 160ms ease-out, box-shadow 160ms ease-out, transform 120ms ease-out",
      }}
    >
      {children}
    </button>
  );
}
