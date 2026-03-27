import { LOW_TIME_SECONDS_THRESHOLD } from "@/lib/gameRoundConfig";
import { Lives } from "./Lives";
import { Timer } from "./Timer";
import { SoundButton } from "./SoundButton";
import { PauseButton } from "./PauseButton";

type GameMode = "play" | "reveal" | "results";

interface TopHUDProps {
  lives: number;
  elapsedSeconds: number;
  isMuted: boolean;
  mode?: GameMode;
  /** Segundos restantes por debajo de los cuales el reloj se pone en rojo */
  lowTimeThreshold?: number;
  connectedCount?: number;
  totalCards?: number;
  onPauseClick: () => void;
  onMuteToggle: () => void;
  /** Coach (preview): marca Lives y Pause para medir spotlights del tutorial */
  coachHudMeasureTargets?: boolean;
}

export function TopHUD({
  lives,
  elapsedSeconds,
  isMuted,
  mode = "play",
  lowTimeThreshold = LOW_TIME_SECONDS_THRESHOLD,
  connectedCount = 0,
  totalCards = 4,
  onPauseClick,
  onMuteToggle,
  coachHudMeasureTargets = false,
}: TopHUDProps) {
  const isLowTime =
    mode === "play" && elapsedSeconds <= lowTimeThreshold;

  return (
    <div className="relative z-10 w-full flex items-center py-4 px-6">
      {/* LEFT - Lives (play y resultados; oculto en reveal) */}
      {(mode === "play" || mode === "results") && (
        <div
          className={
            coachHudMeasureTargets
              ? "absolute left-6 top-1/2 -translate-y-1/2"
              : "absolute left-6"
          }
          {...(coachHudMeasureTargets ? ({ "data-coach-lives-target": "" } as const) : {})}
        >
          <Lives lives={lives} maxLives={5} />
        </div>
      )}

      {/* CENTER - Timer congelado en results (sin pulso rojo) */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <Timer
          value={elapsedSeconds}
          formatAsTime
          showRevealIcon={mode === "reveal"}
          isLowTime={mode === "results" ? false : isLowTime}
        />
      </div>

      {/* RIGHT - Sound + Pause (play, resultados recap: mismo control que en partida) */}
      {(mode === "play" || mode === "results") && (
        <div
          className={
            coachHudMeasureTargets
              ? "absolute right-6 top-1/2 -translate-y-1/2"
              : "absolute right-6"
          }
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <SoundButton isMuted={isMuted} onClick={onMuteToggle} />
            <div
              {...(coachHudMeasureTargets
                ? ({ "data-coach-pause-target": "" } as const)
                : {})}
            >
              <PauseButton onClick={onPauseClick} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
