"use client";

import Image from "next/image";

interface RevealAnswersButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export function RevealAnswersButton({
  onClick,
  disabled = false,
}: RevealAnswersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="game-focus-visible"
      style={{
        display: "inline-flex",
        height: "60px",
        padding: "12.815px 32px 12.815px 24px",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        borderRadius: "32px 32px 0 0",
        borderTop: "2px solid rgba(255, 255, 255, 0.20)",
        borderRight: "2px solid rgba(255, 255, 255, 0.20)",
        borderLeft: "2px solid rgba(255, 255, 255, 0.20)",
        borderBottom: "none",
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.00) 24.06%, rgba(255, 255, 255, 0.10) 100%)",
        backgroundBlendMode: "screen",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      aria-label="Reveal Answers"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src="/assets/reveal-magic-wand.png"
          alt="Reveal answers icon"
          width={24}
          height={24}
        />
      </div>

      <span
        style={{
          fontFamily: "var(--font-bitter), serif",
          fontSize: "20px",
          fontWeight: 600,
          color: "#FFFFFF",
          whiteSpace: "nowrap",
        }}
      >
        Reveal Answers
      </span>
    </button>
  );
}
