"use client";

export function BackgroundHalos() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Halo 1 */}
      <div
        className="game-halo game-halo-1"
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.14,
          left: "15%",
          top: "25%",
        }}
      />
      {/* Halo 2 */}
      <div
        className="game-halo game-halo-2"
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.12,
          right: "10%",
          top: "40%",
        }}
      />
      {/* Halo 3 */}
      <div
        className="game-halo game-halo-3"
        style={{
          position: "absolute",
          width: "320px",
          height: "320px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.16,
          left: "50%",
          bottom: "15%",
          marginLeft: "-160px",
        }}
      />
    </div>
  );
}
