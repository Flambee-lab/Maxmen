import type { CSSProperties } from "react";

/**
 * Specs: reposo = plano (sin “elevación”).
 * Seleccionado = glow fuerte con azul lavado (#a3bff9 / periwinkle) bien distinto del rest.
 */
export function getSpecsSelectorShellStyle(
  hovered: boolean,
  selected: boolean,
  disabled: boolean
): CSSProperties {
  const transition =
    "background 160ms ease-out, box-shadow 180ms ease-out, border-color 160ms ease-out, transform 120ms ease-out";

  if (disabled) {
    return {
      borderRadius: "47.23px",
      cursor: "not-allowed",
      border: "2px solid rgba(255, 255, 255, 0.12)",
      background: "rgba(255, 255, 255, 0.04)",
      boxShadow: "none",
      transition,
    };
  }

  // —— Seleccionado: el blanco va en fondo + borde del contenedor; sombras solo azules (sin halos blancos) ——
  if (selected) {
    const h = hovered;
    return {
      borderRadius: "47.23px",
      cursor: "pointer",
      border: h
        ? "2px solid rgba(255, 255, 255, 0.68)"
        : "2px solid rgba(255, 255, 255, 0.55)",
      background: h
        ? "linear-gradient(168deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.38) 22%, rgba(248, 250, 255, 0.3) 52%, rgba(210, 226, 255, 0.2) 100%)"
        : "linear-gradient(168deg, rgba(255, 255, 255, 0.44) 0%, rgba(255, 255, 255, 0.3) 28%, rgba(238, 244, 255, 0.26) 58%, rgba(195, 215, 255, 0.16) 100%)",
      boxShadow: h
        ? [
            "0 0 0 1px rgba(163, 191, 249, 0.35)",
            "0 0 32px rgba(130, 175, 255, 0.55)",
            "0 0 48px rgba(163, 191, 249, 0.35)",
            "inset 0 -1px 0 rgba(65, 105, 180, 0.12)",
          ].join(", ")
        : [
            "0 0 0 1px rgba(163, 191, 249, 0.28)",
            "0 0 24px rgba(120, 165, 240, 0.45)",
            "0 0 40px rgba(163, 191, 249, 0.28)",
            "inset 0 -1px 0 rgba(70, 110, 190, 0.1)",
          ].join(", "),
      transition,
    };
  }

  // —— Repos / hover: plano, sin drop shadow tipo “pastilla elevada” ——
  return {
    borderRadius: "47.23px",
    cursor: "pointer",
    border: hovered
      ? "2px solid rgba(255, 255, 255, 0.48)"
      : "2px solid rgba(255, 255, 255, 0.32)",
    background: hovered
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(255, 255, 255, 0.06)",
    // Solo brillo muy suave; nada de sombra oscura grande ni inset profundo
    boxShadow: hovered
      ? "0 0 18px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
      : "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    transition,
  };
}
