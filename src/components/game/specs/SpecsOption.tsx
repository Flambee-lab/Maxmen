"use client";

interface SpecsOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
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
export function SpecsOption({ label, selected, onClick }: SpecsOptionProps) {
  return (
    <div
      className="specs-option-btn"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        width: "320px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        fontFamily: "var(--font-bitter), serif",
        fontSize: "20px",
        fontWeight: 600,
        color: "#FFFFFF",
        cursor: "pointer",
        outline: "none",
        outlineOffset: 0,
        ...(selected ? SELECTED_STYLE : REST_STYLE),
      }}
    >
      {label}
    </div>
  );
}
