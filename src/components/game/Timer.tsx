import Image from "next/image";

interface TimerProps {
  value: number;
  showRevealIcon?: boolean;
}

const TIMER_SIZE = 60;
const ICON_SIZE = 24;

export function Timer({ value, showRevealIcon = false }: TimerProps) {
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
    >
      {showRevealIcon ? (
        <Image
          src="/assets/reveal-magic-wand.png"
          alt="Reveal"
          width={ICON_SIZE}
          height={ICON_SIZE}
        />
      ) : (
        <span
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 600,
            fontSize: "24px",
            color: "#FFFFFF",
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
