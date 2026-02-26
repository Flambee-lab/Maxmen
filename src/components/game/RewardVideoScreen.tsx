"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { GamePrimaryButton } from "./GamePrimaryButton";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface RewardVideoScreenProps {
  /** Al terminar el video (onEnded) o al pulsar Skip */
  onComplete: () => void;
}

const VIDEO_SRC = "/video/reward.mp4";

export function RewardVideoScreen({ onComplete }: RewardVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) setCurrentTime(v.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration)) setDuration(v.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete();
  }, [onComplete]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setShowPlayOverlay(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleCanPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => {
      handlePlay();
      v.muted = false;
    }).catch(() => {
      setShowPlayOverlay(true);
    });
  }, [handlePlay]);

  const handlePlayClick = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => {
      setShowPlayOverlay(false);
      handlePlay();
    }).catch(() => {});
  }, [handlePlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("timeupdate", handleTimeUpdate);
    v.addEventListener("loadedmetadata", handleLoadedMetadata);
    v.addEventListener("ended", handleEnded);
    v.addEventListener("play", handlePlay);
    v.addEventListener("pause", handlePause);
    v.addEventListener("canplay", handleCanPlay);
    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("loadedmetadata", handleLoadedMetadata);
      v.removeEventListener("ended", handleEnded);
      v.removeEventListener("play", handlePlay);
      v.removeEventListener("pause", handlePause);
      v.removeEventListener("canplay", handleCanPlay);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handlePlay, handlePause, handleCanPlay]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
      {/* Skip arriba del video */}
      <div className="mb-6">
        <GamePrimaryButton onClick={onComplete}>
          Skip
        </GamePrimaryButton>
      </div>

      {/* Contenedor del video: inline, sin fullscreen obligatorio */}
      <div className="relative rounded-2xl overflow-hidden bg-black/40" style={{ maxWidth: "640px", width: "100%" }}>
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          playsInline
          muted
          autoPlay
          className="w-full aspect-video object-contain block"
          style={{ maxHeight: "60vh" }}
        />

        {/* Overlay de play si autoplay falló */}
        {showPlayOverlay && !isPlaying && (
          <button
            type="button"
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold text-lg"
            aria-label="Reproducir"
          >
            <span style={{ fontFamily: "var(--font-bitter), serif" }}>Play</span>
          </button>
        )}
      </div>

      {/* Progreso abajo: tiempo y barra */}
      <div className="mt-6 w-full flex flex-col items-center" style={{ maxWidth: "640px" }}>
        <div
          className="w-full h-2 rounded-full bg-white/20 overflow-hidden"
          style={{ maxWidth: "640px" }}
        >
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-150"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
            }}
          />
        </div>
        <p
          className="mt-2 text-white/90 text-sm tabular-nums"
          style={{ fontFamily: "var(--font-bitter), serif" }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>
    </div>
  );
}
