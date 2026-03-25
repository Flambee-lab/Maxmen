"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { GamePrimaryButton } from "./GamePrimaryButton";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface RewardVideoScreenProps {
  /** Al terminar el clip (máx. unos segundos), al terminar el vídeo nativo o al pulsar Skip → resultados */
  onComplete: () => void;
}

/**
 * IDs Mixkit (perritos). URL: https://assets.mixkit.co/videos/{id}/{id}-720.mp4
 * Se elige uno al azar; si falla, se prueba el siguiente.
 */
const MIXKIT_DOG_VIDEO_IDS = [
  1210,
  1494,
  1479,
  1548,
  1478,
  45843,
  45868,
  101245,
  101244,
  101239,
  1476,
  1550,
] as const;

const REMOTE_DOG_VIDEOS = MIXKIT_DOG_VIDEO_IDS.map(
  (id) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
);

const LOCAL_FALLBACK = "/video/reward.mp4";

/** Duración máxima del clip de recompensa (segundos) — pasa a resultados al cumplirse */
const REWARD_CLIP_MAX_SECONDS = 6;

export function RewardVideoScreen({ onComplete }: RewardVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [effectiveDuration, setEffectiveDuration] = useState(REWARD_CLIP_MAX_SECONDS);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const startIndex = useMemo(
    () => Math.floor(Math.random() * REMOTE_DOG_VIDEOS.length),
    [],
  );
  const [attempt, setAttempt] = useState(0);

  const videoSrc = useMemo(() => {
    const n = REMOTE_DOG_VIDEOS.length;
    if (attempt < n) {
      return REMOTE_DOG_VIDEOS[(startIndex + attempt) % n];
    }
    return LOCAL_FALLBACK;
  }, [attempt, startIndex]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
      } catch {
        /* ignore */
      }
    }
    onComplete();
  }, [onComplete]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || completedRef.current) return;
    const t = v.currentTime;
    if (t >= REWARD_CLIP_MAX_SECONDS) {
      finish();
      return;
    }
    setCurrentTime(t);
  }, [finish]);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const cap = Math.min(v.duration, REWARD_CLIP_MAX_SECONDS);
    setEffectiveDuration(cap > 0 ? cap : REWARD_CLIP_MAX_SECONDS);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    finish();
  }, [finish]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setShowPlayOverlay(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const tryAutoplay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    const onFail = () => setShowPlayOverlay(true);
    if (p === undefined) {
      handlePlay();
      v.muted = false;
      return;
    }
    p.then(() => {
      handlePlay();
      v.muted = false;
    }).catch(onFail);
  }, [handlePlay]);

  const handleCanPlay = useCallback(() => {
    tryAutoplay();
  }, [tryAutoplay]);

  const handlePlayClick = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p === undefined) {
      setShowPlayOverlay(false);
      handlePlay();
      return;
    }
    p.then(() => {
      setShowPlayOverlay(false);
      handlePlay();
    }).catch(() => {});
  }, [handlePlay]);

  const handleVideoError = useCallback(() => {
    setAttempt((prev) => {
      const n = REMOTE_DOG_VIDEOS.length;
      if (prev < n) {
        return prev + 1;
      }
      queueMicrotask(() => setShowPlayOverlay(true));
      return prev;
    });
  }, []);

  useEffect(() => {
    completedRef.current = false;
    setCurrentTime(0);
    setEffectiveDuration(REWARD_CLIP_MAX_SECONDS);
  }, [videoSrc]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("timeupdate", handleTimeUpdate);
    v.addEventListener("loadedmetadata", handleLoadedMetadata);
    v.addEventListener("ended", handleEnded);
    v.addEventListener("play", handlePlay);
    v.addEventListener("pause", handlePause);
    v.addEventListener("canplay", handleCanPlay);
    v.addEventListener("error", handleVideoError);
    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("loadedmetadata", handleLoadedMetadata);
      v.removeEventListener("ended", handleEnded);
      v.removeEventListener("play", handlePlay);
      v.removeEventListener("pause", handlePause);
      v.removeEventListener("canplay", handleCanPlay);
      v.removeEventListener("error", handleVideoError);
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    handlePlay,
    handlePause,
    handleCanPlay,
    handleVideoError,
  ]);

  const progressPct =
    effectiveDuration > 0
      ? Math.min(100, (currentTime / effectiveDuration) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      role="dialog"
      aria-label="Video de recompensa"
    >
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        aria-label="Video de un perrito — recompensa"
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col pointer-events-none">
        {showPlayOverlay && !isPlaying && (
          <button
            type="button"
            onClick={handlePlayClick}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 text-white pointer-events-auto"
            aria-label="Reproducir video"
          >
            <span
              className="rounded-full border-2 border-white/80 px-8 py-4 text-lg font-bold"
              style={{ fontFamily: "var(--font-bitter), serif" }}
            >
              Play
            </span>
          </button>
        )}

        <div className="min-h-0 flex-1" aria-hidden />

        {/* Timeline pegada al borde inferior, ancho completo; Skip 12px bajo la barra, 24px del borde derecho */}
        <div
          className="pointer-events-none shrink-0 w-full bg-gradient-to-t from-black via-black/85 to-transparent pt-14"
          style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        >
          <div className="pointer-events-auto w-full max-w-none">
            {/* Barra de progreso: punta a punta */}
            <div className="h-1.5 w-full overflow-hidden bg-white/25">
              <div
                className="h-full bg-white/85 transition-[width] duration-150 ease-linear"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div
              className="relative flex w-full items-start justify-end"
              style={{ marginTop: 12 }}
            >
              <p
                className="absolute left-1/2 top-0 -translate-x-1/2 text-sm tabular-nums text-white/85"
                style={{ fontFamily: "var(--font-bitter), serif" }}
              >
                {formatTime(Math.min(currentTime, REWARD_CLIP_MAX_SECONDS))} /{" "}
                {formatTime(effectiveDuration)}
              </p>
              <div style={{ paddingRight: 24 }} className="z-10 flex-shrink-0">
                <GamePrimaryButton onClick={finish} aria-label="Saltar video e ir a resultados">
                  Skip
                </GamePrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
