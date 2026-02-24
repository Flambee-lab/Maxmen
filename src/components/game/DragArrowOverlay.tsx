"use client";

interface DragArrowOverlayProps {
  originX: number;
  originY: number;
  tipX: number;
  tipY: number;
}

const STROKE_WIDTH = 4;
const ARROW_HEAD_SIZE = 8;
const LIFT = 8;

export function DragArrowOverlay({
  originX,
  originY,
  tipX,
  tipY,
}: DragArrowOverlayProps) {
  const startX = originX;
  const startY = originY;
  const endX = tipX;
  const endY = tipY;

  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < ARROW_HEAD_SIZE * 2) {
    return null;
  }

  const p1x = startX;
  const p1y = startY - LIFT;

  // Curva inmediata: 8px recto, luego una sola Q hacia el endpoint (sin tramo vertical largo)
  const pathD = [
    `M ${startX} ${startY}`,
    `L ${p1x} ${p1y}`,
    `Q ${p1x} ${endY} ${endX} ${endY}`,
  ].join(" ");

  // Dirección del último tramo (horizontal): (p1x, endY) -> (endX, endY)
  const lastDx = endX - p1x;
  const angle = Math.abs(lastDx) < 1e-6 ? Math.atan2(dy, dx) : Math.atan2(0, lastDx);
  const baseX = endX - Math.cos(angle) * ARROW_HEAD_SIZE;
  const baseY = endY - Math.sin(angle) * ARROW_HEAD_SIZE;
  const arrowHeadX1 = baseX - Math.sin(angle) * ARROW_HEAD_SIZE;
  const arrowHeadY1 = baseY + Math.cos(angle) * ARROW_HEAD_SIZE;
  const arrowHeadX2 = baseX + Math.sin(angle) * ARROW_HEAD_SIZE;
  const arrowHeadY2 = baseY - Math.cos(angle) * ARROW_HEAD_SIZE;

  return (
    <svg
      className="pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 50,
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
        style={{ opacity: 1 }}
      >
        <path d={pathD} />
        <polyline
          points={`${endX},${endY} ${arrowHeadX1},${arrowHeadY1} ${arrowHeadX2},${arrowHeadY2} ${endX},${endY}`}
        />
      </g>
    </svg>
  );
}
