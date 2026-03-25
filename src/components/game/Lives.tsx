import Image from "next/image";

interface LivesProps {
  lives: number;
  maxLives: number;
  /** Más pequeño para HUD secundario (p. ej. pantalla de resultados) */
  size?: "default" | "compact";
}

const SIZES = {
  default: {
    lamp: 68,
    scale: 1.15,
    overlap: -32,
  },
  compact: {
    lamp: 44,
    scale: 1.08,
    overlap: -22,
  },
} as const;

export function Lives({ lives, maxLives, size = "default" }: LivesProps) {
  const { lamp: LAMP_SIZE, scale: LAMP_SCALE, overlap: OVERLAP } = SIZES[size];

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        margin: 0,
        padding: 0,
      }}
    >
      {Array.from({ length: maxLives }).map((_, index) => {
        const isActive = index < lives;
        return (
          <div
            key={index}
            style={{
              width: `${LAMP_SIZE}px`,
              height: `${LAMP_SIZE}px`,
              margin: 0,
              marginLeft: index > 0 ? `${OVERLAP}px` : "0",
              padding: 0,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={`Lámpara ${index + 1} ${isActive ? "encendida" : "apagada"}`}
          >
            {isActive ? (
              <Image
                src="/assets/life.png"
                alt={`Lámpara encendida ${index + 1}`}
                width={LAMP_SIZE}
                height={LAMP_SIZE}
                style={{
                  width: `${LAMP_SIZE}px`,
                  height: `${LAMP_SIZE}px`,
                  display: "block",
                  transform: `scale(${LAMP_SCALE})`,
                  transformOrigin: "center",
                }}
                priority={index < 2}
              />
            ) : (
              <Image
                src="/assets/life-off.svg"
                alt={`Lámpara apagada ${index + 1}`}
                width={LAMP_SIZE}
                height={LAMP_SIZE}
                style={{
                  width: `${LAMP_SIZE}px`,
                  height: `${LAMP_SIZE}px`,
                  display: "block",
                  transform: `scale(${LAMP_SCALE})`,
                  transformOrigin: "center",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
