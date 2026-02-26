import Image from "next/image";

interface SoundButtonProps {
  isMuted: boolean;
  onClick: () => void;
}

const BUTTON_SIZE = 60;
const ICON_SIZE = 32;

export function SoundButton({ isMuted, onClick }: SoundButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: `${BUTTON_SIZE}px`,
        height: `${BUTTON_SIZE}px`,
        borderRadius: "50%",
        backgroundColor: "rgba(0, 0, 0, 0.20)",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      <Image
        src={isMuted ? "/assets/speaker-off.png" : "/assets/speaker.png"}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
      />
    </button>
  );
}
