import { Lives } from "./Lives";
import { Timer } from "./Timer";
import { SoundButton } from "./SoundButton";
import { PauseButton } from "./PauseButton";

type GameMode = "play" | "reveal";

interface TopHUDProps {
  lives: number;
  elapsedSeconds: number;
  isMuted: boolean;
  mode?: GameMode;
  connectedCount?: number;
  totalCards?: number;
  onPauseClick: () => void;
  onMuteToggle: () => void;
}

export function TopHUD({
  lives,
  elapsedSeconds,
  isMuted,
  mode = "play",
  connectedCount = 0,
  totalCards = 4,
  onPauseClick,
  onMuteToggle,
}: TopHUDProps) {
  return (
    <div className="relative z-10 w-full flex items-center py-4 px-6">
      {/* LEFT - Lives (oculto en reveal mode) */}
      {mode === "play" && (
        <div className="absolute left-6">
          <Lives lives={lives} maxLives={5} />
        </div>
      )}

      {/* CENTER - Timer (sin Connected X/4) */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <Timer
          value={elapsedSeconds}
          formatAsTime
          showRevealIcon={mode === "reveal"}
        />
      </div>

      {/* RIGHT - Sound + Pause (ocultos en reveal mode) */}
      {mode === "play" && (
        <div className="absolute right-6">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <SoundButton isMuted={isMuted} onClick={onMuteToggle} />
            <PauseButton onClick={onPauseClick} />
          </div>
        </div>
      )}
    </div>
  );
}
