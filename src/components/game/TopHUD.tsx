import { Lives } from "./Lives";
import { Timer } from "./Timer";
import { SoundButton } from "./SoundButton";
import { PauseButton } from "./PauseButton";

type GameMode = "play" | "reveal";

interface TopHUDProps {
  lives: number;
  round: number;
  isMuted: boolean;
  mode?: GameMode;
  onPauseClick: () => void;
  onMuteToggle: () => void;
}

export function TopHUD({
  lives,
  round,
  isMuted,
  mode = "play",
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

      {/* CENTER - Timer (centrado respecto al viewport) */}
      <div className="flex-1 flex justify-center">
        <Timer value={round} showRevealIcon={mode === "reveal"} />
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
