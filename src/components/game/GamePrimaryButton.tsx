"use client";

interface GamePrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Botón primario del juego: mismo estilo que Start Game / Continue.
 * Reutilizado en Intro (Start Game) y Specs (Continue).
 */
export function GamePrimaryButton({
  children,
  onClick,
  disabled = false,
  className = "",
  style = {},
}: GamePrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`game-focus-visible ${className}`.trim()}
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
        background:
          "linear-gradient(0deg, rgba(0, 0, 0, 0.00) 24.06%, #000 100%), #5A7DAB",
        backgroundBlendMode: "overlay, normal",
        boxShadow:
          "0 15px 15px 0 rgba(0, 0, 0, 0.40), 0 4px 4px 0 rgba(255, 255, 255, 0.80) inset, -6px -13px 7.2px 0 rgba(0, 0, 0, 0.30) inset",
        fontFamily: "var(--font-bitter), serif",
        fontSize: "24px",
        fontWeight: 700,
        color: "#FFFFFF",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
