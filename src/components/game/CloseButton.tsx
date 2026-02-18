interface CloseButtonProps {
  onClick: () => void;
}

const BUTTON_SIZE = 60;
const ICON_SIZE = 24;

export function CloseButton({ onClick }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        borderRadius: "32px",
        border: "2px solid #FFF",
        background:
          "linear-gradient(232deg, rgba(255, 255, 255, 0.00) -43.91%, rgba(255, 255, 255, 0.15) 42.3%)",
        boxShadow:
          "0 42px 32.4px 0 rgba(0, 0, 0, 0.10), 0 -14px 14.2px 0 rgba(255, 255, 255, 0.10) inset",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Close"
    >
      <svg
        width={ICON_SIZE}
        height={ICON_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
}
