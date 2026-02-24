interface ConnectorArrowProps {
  height?: number;
  isDragging?: boolean;
}

const DEFAULT_HEIGHT = 32;
const ARROW_WIDTH = 24;
const STROKE_WIDTH = 4;
/** Flechas SIEMPRE blanco 100% en rest y en drag */
const ARROW_COLOR = "#FFFFFF";

export function ConnectorArrow({
  height = DEFAULT_HEIGHT,
  isDragging = false,
}: ConnectorArrowProps) {
  const clampedHeight = Math.max(height, STROKE_WIDTH * 2);

  return (
    <svg
      width={ARROW_WIDTH}
      height={clampedHeight}
      viewBox={`0 0 ${ARROW_WIDTH} ${clampedHeight + 4}`}
      style={{
        display: "block",
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      <g
        stroke={ARROW_COLOR}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ opacity: 1 }}
      >
        <line
          x1={ARROW_WIDTH / 2}
          y1={clampedHeight - STROKE_WIDTH / 2}
          x2={ARROW_WIDTH / 2}
          y2={STROKE_WIDTH / 2 + 8}
        />
        <polygon
          points={`${ARROW_WIDTH / 2},${STROKE_WIDTH / 2} ${
            ARROW_WIDTH / 2 - 6
          },${STROKE_WIDTH / 2 + 8} ${
            ARROW_WIDTH / 2 + 6
          },${STROKE_WIDTH / 2 + 8}`}
          fill={ARROW_COLOR}
        />
      </g>
    </svg>
  );
}
