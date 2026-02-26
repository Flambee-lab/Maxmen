import Image from "next/image";

interface TimerProps {
  value: number;
  formatAsTime?: boolean;
  showRevealIcon?: boolean;
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
}: TimerProps) {
  const display = formatAsTime ? formatMmSs(value) : String(value);

  return (
    <div
      style={{
        width: `${TIMER_SIZE}px`,
        height: `${TIMER_SIZE}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 0 0 4px rgba(255, 255, 255, 0.10)",
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
            color: "#FFFFFF",
          }}
        >
          {display}
        </span>
      )}
    </div>
  );
}
