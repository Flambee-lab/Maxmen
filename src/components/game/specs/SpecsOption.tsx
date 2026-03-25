"use client";

import type { ReactNode } from "react";

interface SpecsOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Si true, no responde al click (opción no elegible en este paso) */
  disabled?: boolean;
  /** Icono a la izquierda del label (misma pill, mismo estilo que el resto de Specs). */
  icon?: ReactNode;
}

const REST_STYLE: React.CSSProperties = {
  borderRadius: "47.23px",
  border: "1px solid #FFF",
  background: "rgba(255, 255, 255, 0.20)",
  boxShadow:
    "0 3px 0 0 rgba(255, 255, 255, 0.25) inset, 0 -4px 0 0 #FFF inset",
};

const SELECTED_STYLE: React.CSSProperties = {
  borderRadius: "47.23px",
  border: "4px solid #101665",
  background: "rgba(16, 22, 101, 0.35)",
  outline: "none",
  outlineOffset: 0,
};

/**
 * Selector de categoría en SpecsScreen.
 * REST o SELECTED según prop selected; onClick para cambiar selección.
 */
export function SpecsOption({
  label,
  selected,
  onClick,
  disabled = false,
  icon,
}: SpecsOptionProps) {
  return (
    <div
      className="specs-option-btn"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick();
      }}
      onKeyDown={(e) => {
        if (!disabled && e.key === "Enter") onClick();
      }}
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
        ...(selected ? SELECTED_STYLE : REST_STYLE),
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
