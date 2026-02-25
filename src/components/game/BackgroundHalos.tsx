"use client";

export function BackgroundHalos() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {/* Halo 1 */}
      <div
        className="game-halo game-halo-1"
        style={{
          position: "absolute",
          width: "520px",
          height: "520px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.3,
          left: "15%",
          top: "25%",
        }}
      />
      {/* Halo 2 */}
      <div
        className="game-halo game-halo-2"
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.28,
          right: "10%",
          top: "40%",
        }}
      />
      {/* Halo 3 */}
      <div
        className="game-halo game-halo-3"
        style={{
          position: "absolute",
          width: "480px",
          height: "480px",
          background: "rgba(255, 255, 255, 0.20)",
          filter: "blur(120px)",
          borderRadius: "9999px",
          opacity: 0.3,
          left: "50%",
          bottom: "15%",
          marginLeft: "-240px",
        }}
      />
    </div>
  );
}
