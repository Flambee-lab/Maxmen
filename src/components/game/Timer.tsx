interface TimerProps {
  value: number;
}

const TIMER_SIZE = 60;

export function Timer({ value }: TimerProps) {
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
    </div>
  );
}
