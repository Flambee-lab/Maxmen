"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { BackButton } from "@/components/game/BackButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { SpecsOption } from "@/components/game/specs/SpecsOption";
import {
  SPECS_PRIMARY_ACTION_BOTTOM_PX,
  SPECS_PRIMARY_ACTION_RIGHT_PX,
} from "@/components/specs/specsFooterConstants";
import {
  SPECS_CHIP_BLOCK_MAX_WIDTH_PX,
  getSpecsChipRowStyle,
} from "@/components/specs/specsChipLayout";

const HEADER_FOOTER_PADDING = 16;
const HEADER_FOOTER_PADDING_X = 24;

export interface SpecsStep2SubgroupScreenProps {
  /** Subgrupos / “All places” según data cargada */
  options: ReadonlyArray<{ id: string; label: string; icon?: ReactNode }>;
  onContinue: (selectedIds: string[]) => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  maxSelectable?: number;
  title?: string;
}

/**
 * Specs paso 2 — elige subgrupo(s) dentro del topic elegido en paso 1.
 */
export function SpecsStep2SubgroupScreen({
  options,
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
  maxSelectable = 3,
  title = "Who do you want to focus on?",
}: SpecsStep2SubgroupScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const on = prev.includes(id);
      if (on) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelectable) return prev;
      return [...prev, id];
    });
  };

  const canContinue = selected.length >= 1;

  return (
    <div className="relative z-10 min-h-screen w-full overflow-hidden">
      {onBack && (
        <div
          className="absolute left-6 z-20"
          style={{ top: `${HEADER_FOOTER_PADDING}px` }}
        >
          <BackButton onClick={onBack} />
        </div>
      )}
      <div
        className="absolute right-6 z-20 flex items-center gap-3"
        style={{ top: `${HEADER_FOOTER_PADDING}px` }}
      >
        <SoundButton isMuted={isMuted} onClick={onMuteToggle} />
        <CloseButton onClick={() => router.push("/")} />
      </div>

      <div
        className="absolute left-0 right-0 z-10 flex flex-col items-center"
        style={{
          top: `${HEADER_FOOTER_PADDING + 8}px`,
          paddingLeft: `${HEADER_FOOTER_PADDING_X}px`,
          paddingRight: `${HEADER_FOOTER_PADDING_X}px`,
        }}
      >
        <h1
          className="w-full text-center text-white"
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 700,
            fontSize: "48px",
            color: "#FFFFFF",
            lineHeight: 1.25,
            marginBottom: "8px",
          }}
        >
          {title}
        </h1>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 1, padding: "24px 16px 120px", paddingTop: "clamp(200px, 28vh, 320px)" }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ maxWidth: `${SPECS_CHIP_BLOCK_MAX_WIDTH_PX}px` }}
        >
          {options.length === 0 ? (
            <p
              className="text-center text-white/80"
              style={{
                fontFamily: "var(--font-bitter), serif",
                fontSize: "20px",
                maxWidth: "520px",
              }}
            >
              No subgroups available for your selection. Go back and choose
              different topics, or add content in the library.
            </p>
          ) : (
            <div style={getSpecsChipRowStyle(3)}>
              {options.map((opt, index) => (
                <div
                  key={opt.id}
                  className="specs-option-enter"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <SpecsOption
                    label={opt.label}
                    icon={opt.icon}
                    selected={selected.includes(opt.id)}
                    disabled={false}
                    onClick={() => toggle(opt.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute z-20"
        style={{
          right: `${SPECS_PRIMARY_ACTION_RIGHT_PX}px`,
          bottom: `${SPECS_PRIMARY_ACTION_BOTTOM_PX}px`,
        }}
      >
        <GamePrimaryButton
          onClick={() => onContinue(selected)}
          disabled={!canContinue || options.length === 0}
        >
          Continue
        </GamePrimaryButton>
      </div>
    </div>
  );
}
