import type { CSSProperties } from "react";

export const SPECS_OPTION_PILL_WIDTH_PX = 320;
export const SPECS_OPTION_GAP_PX = 16;

/** Ancho máximo del bloque de chips cuando caben hasta 3 por fila (3×320 + 2×16). */
export const SPECS_CHIP_BLOCK_MAX_WIDTH_PX =
  SPECS_OPTION_PILL_WIDTH_PX * 3 + SPECS_OPTION_GAP_PX * 2;

/** Ancho del bloque según cuántas columnas máximas por fila (2 o 3). */
export function specsChipBlockMaxWidthPx(maxPerRow: 2 | 3): number {
  return (
    SPECS_OPTION_PILL_WIDTH_PX * maxPerRow +
    SPECS_OPTION_GAP_PX * (maxPerRow - 1)
  );
}

/**
 * Filas centradas en el ancho: 1 chip al centro, 2 chips centrados, hasta `maxPerRow` por línea con wrap.
 */
export function getSpecsChipRowStyle(maxPerRow: 2 | 3): CSSProperties {
  return {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    gap: `${SPECS_OPTION_GAP_PX}px`,
    width: "100%",
    maxWidth: `${specsChipBlockMaxWidthPx(maxPerRow)}px`,
  };
}
