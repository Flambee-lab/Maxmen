"use client";

import React, { useState } from "react";
import { playClickSfx } from "@/lib/clickSfx";

interface GamePrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const BASE_BG =
  "linear-gradient(0deg, rgba(0, 0, 0, 0.00) 24.06%, #000 100%), #5A7DAB";
const HOVER_BG =
  "linear-gradient(0deg, rgba(0, 0, 0, 0.00) 20%, #000 100%), #6B8FC0";
const PRESSED_BG =
  "linear-gradient(0deg, rgba(0, 0, 0, 0.15) 32%, #000 100%), #4C6C96";

const BASE_SHADOW =
  "0 15px 15px 0 rgba(0, 0, 0, 0.40), 0 4px 4px 0 rgba(255, 255, 255, 0.80) inset, -6px -13px 7.2px 0 rgba(0, 0, 0, 0.30) inset";
const PRESSED_SHADOW =
  "0 8px 10px 0 rgba(0, 0, 0, 0.55), 0 2px 2px 0 rgba(255, 255, 255, 0.7) inset, -4px -8px 6px 0 rgba(0, 0, 0, 0.45) inset";
const DISABLED_SHADOW =
  "0 6px 10px 0 rgba(0, 0, 0, 0.25), 0 2px 2px 0 rgba(255, 255, 255, 0.25) inset";

/**
 * Botón primario del juego: mismo estilo que Start Game / Continue.
 * Reutilizado en Intro (Start Game) y Specs (Continue). Estados: hover, pressed, focus, disabled.
 */
export function GamePrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  style = {},
}: GamePrimaryButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const background = disabled
    ? BASE_BG
    : isPressed
    ? PRESSED_BG
    : isHovered
    ? HOVER_BG
    : BASE_BG;

  const boxShadow = disabled
    ? DISABLED_SHADOW
    : isPressed
    ? PRESSED_SHADOW
    : BASE_SHADOW;

  const transform = disabled ? "translateY(0)" : isPressed ? "translateY(2px)" : "translateY(0)";

  return (
    <button
      type="button"
      onClick={() => {
        if (disabled) return;
        playClickSfx();
        onClick?.();
      }}
      disabled={disabled}
      className={`game-focus-visible ${className}`.trim()}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={(e) => {
        if (e.button !== 0 || disabled) return;
        setIsPressed(true);
      }}
      onMouseUp={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          if (!disabled) setIsPressed(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") setIsPressed(false);
      }}
      style={{
        width: "320px",
        height: "68px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6.407px",
        padding: "12.815px 23.133px",
        borderRadius: "32px",
        border: "2px solid rgba(255, 255, 255, 0.40)",
        background,
        backgroundBlendMode: "overlay, normal",
        boxShadow,
        fontFamily: "var(--font-bitter), serif",
        fontSize: "24px",
        fontWeight: 700,
        color: "#FFFFFF",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.58 : 1,
        transform,
        transition:
          "background 160ms ease-out, box-shadow 160ms ease-out, transform 120ms ease-out",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

