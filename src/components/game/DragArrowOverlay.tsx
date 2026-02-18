"use client";

interface DragArrowOverlayProps {
  originX: number;
  originY: number;
  tipX: number;
  tipY: number;
}

const STROKE_WIDTH = 4;
const ARROW_HEAD_SIZE = 8;

export function DragArrowOverlay({
  originX,
  originY,
  tipX,
  tipY,
}: DragArrowOverlayProps) {
  const dx = tipX - originX;
  const dy = tipY - originY;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length < ARROW_HEAD_SIZE * 2) {
    return null;
  }

  const backLength = ARROW_HEAD_SIZE;
  const baseX = tipX - Math.cos(angle) * backLength;
  const baseY = tipY - Math.sin(angle) * backLength;

  const arrowHeadX1 = baseX - Math.sin(angle) * backLength;
  const arrowHeadY1 = baseY + Math.cos(angle) * backLength;
  const arrowHeadX2 = baseX + Math.sin(angle) * backLength;
  const arrowHeadY2 = baseY - Math.cos(angle) * backLength;

  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      <g
        stroke="#FFFFFF"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <line x1={originX} y1={originY} x2={tipX} y2={tipY} />
        <polyline
          points={`${tipX},${tipY} ${arrowHeadX1},${arrowHeadY1} ${arrowHeadX2},${arrowHeadY2} ${tipX},${tipY}`}
        />
      </g>
    </svg>
  );
}
