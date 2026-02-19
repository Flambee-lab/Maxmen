"use client";

import { ConnectorArrow } from "./ConnectorArrow";

interface ChipProps {
  label: string;
  nameId: string;
  arrowHeight?: number;
  isHovered?: boolean;
  isDragging?: boolean;
  onArrowPointerDown?: (e: React.PointerEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  chipRef?: (nameId: string, element: HTMLDivElement | null) => void;
}

const OUTER_HEIGHT = 76;
const OUTER_PADDING = 12;
const INNER_HEIGHT = 52;
const INNER_PADDING_X = 12;
const OUTER_RADIUS = 28;
const INNER_RADIUS = 16;
const BORDER_WIDTH = 2;
const ARROW_REST_HEIGHT = 32;

export function Chip({
  label,
  nameId,
  arrowHeight = ARROW_REST_HEIGHT,
  isHovered = false,
  isDragging = false,
  onArrowPointerDown,
  onMouseEnter,
  onMouseLeave,
  chipRef,
}: ChipProps) {
  return (
    <div
      ref={(el) => {
        if (chipRef) {
          chipRef(nameId, el);
        }
      }}
      className="relative flex flex-col items-center"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!isDragging && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "grab",
            pointerEvents: "auto",
          }}
          onPointerDown={onArrowPointerDown}
        >
          <ConnectorArrow height={arrowHeight} isDragging={false} />
        </div>
      )}

      <button
        type="button"
        className="relative"
        style={{
          height: `${OUTER_HEIGHT}px`,
          padding: `${OUTER_PADDING}px`,
          backgroundColor: "rgba(0, 0, 0, 0.10)",
          borderRadius: `${OUTER_RADIUS}px`,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
        aria-label={`Chip ${label}`}
      >
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <rect
            x={BORDER_WIDTH / 2}
            y={BORDER_WIDTH / 2}
            width={`calc(100% - ${BORDER_WIDTH}px)`}
            height={`calc(100% - ${BORDER_WIDTH}px)`}
            rx={OUTER_RADIUS}
            fill="none"
            stroke="rgba(0, 0, 0, 0.40)"
            strokeWidth={BORDER_WIDTH}
            strokeDasharray="6 6"
          />
        </svg>
        <div
          style={{
            height: `${INNER_HEIGHT}px`,
            paddingLeft: `${INNER_PADDING_X}px`,
            paddingRight: `${INNER_PADDING_X}px`,
            borderRadius: `${INNER_RADIUS}px`,
            backgroundColor: "#284B79",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Simulamos un stroke interno con box-shadow inset para no cambiar el tamaño
            ...(isHovered
              ? { boxShadow: "inset 0 0 0 2px #FFFFFF" }
              : {}),
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.80)",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>
      </button>
    </div>
  );
}
