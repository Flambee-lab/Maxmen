"use client";

import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";

interface SpecsContinueButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * Continue en Specs 1–3: halo animado detrás (SFX ya lo dispara GamePrimaryButton).
 */
export function SpecsContinueButton({
  children,
  onClick,
  disabled = false,
}: SpecsContinueButtonProps) {
  return (
    <div className="relative inline-block">
      {!disabled ? (
        <div
          className="specs-continue-glow pointer-events-none absolute rounded-[36px]"
          aria-hidden
          style={{
            left: "-10px",
            right: "-10px",
            top: "-8px",
            bottom: "-8px",
            zIndex: 0,
            opacity: 0.85,
            background:
              "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(163, 191, 249, 0.55) 0%, rgba(76, 118, 190, 0.22) 45%, transparent 72%)",
            filter: "blur(14px)",
          }}
        />
      ) : null}
      <div className="relative z-[1]">
        <GamePrimaryButton disabled={disabled} onClick={onClick}>
          {children}
        </GamePrimaryButton>
      </div>
    </div>
  );
}
