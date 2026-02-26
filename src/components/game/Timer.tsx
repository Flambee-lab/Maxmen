import Image from "next/image";

interface TimerProps {
  value: number;
  formatAsTime?: boolean;
  showRevealIcon?: boolean;
  /** Cuando true (p. ej. ≤20s restantes), círculo rojo y pulso de alerta */
  isLowTime?: boolean;
}

const TIMER_SIZE = 60;
const ICON_SIZE = 24;

function formatMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds}`;
}

export function Timer({
  value,
  formatAsTime = false,
  showRevealIcon = false,
  isLowTime = false,
}: TimerProps) {
  const display = formatAsTime ? formatMmSs(value) : String(value);

  return (
    <div
      className={isLowTime ? "game-timer-low" : undefined}
      data-low-time={isLowTime ? "true" : undefined}
      style={{
        width: `${TIMER_SIZE}px`,
        height: `${TIMER_SIZE}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(isLowTime
          ? {
              backgroundColor: "rgba(220, 53, 69, 0.45)",
              border: "2px solid rgba(220, 53, 69, 1)",
              boxShadow:
                "inset 0 0 0 2px rgba(220, 53, 69, 0.6), 0 0 20px rgba(220, 53, 69, 0.6)",
            }
          : {
              boxShadow: "inset 0 0 0 4px rgba(255, 255, 255, 0.10)",
            }),
      }}
      aria-label={showRevealIcon ? "Reveal mode" : `Time: ${display}`}
    >
      {showRevealIcon ? (
        <Image
          src="/assets/reveal-magic-wand.png"
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
        />
      ) : (
        <span
          className="game-timer-value"
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 600,
            fontSize: "24px",
            color: isLowTime ? "#FF6B6B" : "#FFFFFF",
            textShadow: isLowTime ? "0 0 12px rgba(255, 100, 100, 0.9)" : "none",
          }}
        >
          {display}
        </span>
      )}
    </div>
  );
}
