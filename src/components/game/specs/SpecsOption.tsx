"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { getSpecsSelectorShellStyle } from "@/components/game/specs/specsSelectorStyles";

interface SpecsOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Si true, no responde al click (opción no elegible en este paso) */
  disabled?: boolean;
  /** Icono a la izquierda del label (misma pill, mismo estilo que el resto de Specs). */
  icon?: ReactNode;
}

/**
 * Selector de categoría en Specs: shell blanco vidrio (como Quick Play en Intro) + hover / selección.
 */
export function SpecsOption({
  label,
  selected,
  onClick,
  disabled = false,
  icon,
}: SpecsOptionProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const shell = getSpecsSelectorShellStyle(hovered, selected, disabled);
  const interactive = !disabled;
  const translateY = interactive && pressed ? 1 : 0;

  return (
    <div
      className="specs-option-btn"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-pressed={selected}
      onClick={() => {
        if (!disabled) onClick();
      }}
      onKeyDown={(e) => {
        if (!disabled && e.key === "Enter") onClick();
      }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={(e) => {
        if (e.button === 0 && interactive) setPressed(true);
      }}
      onMouseUp={() => setPressed(false)}
      onBlur={() => setPressed(false)}
      style={{
        width: "320px",
        minHeight: "60px",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: icon ? "12px" : undefined,
        boxSizing: "border-box",
        textAlign: "center",
        fontFamily: "var(--font-bitter), serif",
        fontSize: "20px",
        fontWeight: 600,
        color: "#FFFFFF",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        outlineOffset: 0,
        opacity: disabled ? 0.42 : 1,
        pointerEvents: disabled ? "none" : "auto",
        transform: `translateY(${translateY}px)`,
        textShadow:
          selected && !disabled
            ? "0 1px 0 rgba(255, 255, 255, 0.35), 0 1px 2px rgba(0, 0, 0, 0.35)"
            : "0 1px 2px rgba(0, 0, 0, 0.2)",
        ...shell,
      }}
    >
      {icon ? (
        <span
          className="flex shrink-0 items-center justify-center text-white"
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
      <span>{label}</span>
    </div>
  );
}
