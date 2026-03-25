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

/** Mismo padding que SpecsScreen / TopHUD */
const HEADER_FOOTER_PADDING = 16;
const HEADER_FOOTER_PADDING_X = 24;

/** Ancho total del grid 3×320 + 2×16 (igual que SpecsScreen) */
const GRID_WIDTH = 320 * 3 + 16 * 2;

type PracticeOptionId = "immediate-family" | "all-relatives" | "friends-neighbors";

const OPTIONS: {
  id: PracticeOptionId;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "immediate-family",
    label: "Immediate family",
    icon: <IconFamily />,
  },
  {
    id: "all-relatives",
    label: "All relatives",
    icon: <IconTheaterMasks />,
  },
  {
    id: "friends-neighbors",
    label: "Friends & Neighbors",
    icon: <IconMusicNote />,
  },
];

function IconFamily() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 20v-0.5a4.5 4.5 0 014.5-4.5h1a4.5 4.5 0 014.5 4.5V20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14 20v-0.5a3 3 0 013-3h0.5a3 3 0 013 3V20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTheaterMasks() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="9" cy="11" rx="5" ry="6" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6.5 10.5h1M10.5 10.5h1M8 13.5c.8 1 1.7 1 2.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <ellipse cx="17" cy="11" rx="4.5" ry="5.5" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M14.8 10h1M16.8 10h1M16 13c.5.8 1.2.8 1.7 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMusicNote() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18V7l10-2v11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="7" cy="18" rx="3" ry="2.25" stroke="currentColor" strokeWidth="1.75" />
      <ellipse cx="17" cy="16" rx="3" ry="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

interface SpecsStep2PracticeScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

/**
 * Specs paso 2 — mismos selectores que SpecsScreen (`SpecsOption`).
 * Solo “Immediate family” es elegible; al entrar no hay selección hasta que la elijas.
 * Continue solo con esa opción seleccionada.
 */
export function SpecsStep2PracticeScreen({
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
}: SpecsStep2PracticeScreenProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<PracticeOptionId | null>(null);

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

      {/* Título: misma jerarquía que SpecsScreen */}
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
          What would you like to refresh?
        </h1>
      </div>

      {/* Selectores + banner: agrupados y centrados (como el grid de SpecsScreen) */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 1, padding: "24px 16px 120px" }}
      >
        <div
          className="flex w-full flex-col items-center justify-center"
          style={{ maxWidth: `${GRID_WIDTH}px` }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 320px)",
              gap: "16px",
              justifyItems: "center",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            {OPTIONS.map((opt, index) => (
              <div
                key={opt.id}
                className="specs-option-enter"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <SpecsOption
                  label={opt.label}
                  icon={opt.icon}
                  selected={selectedId === opt.id}
                  disabled={opt.id !== "immediate-family"}
                  onClick={() => {
                    if (opt.id !== "immediate-family") return;
                    setSelectedId((prev) =>
                      prev === "immediate-family" ? null : "immediate-family",
                    );
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="mt-8 w-full rounded-[28px] border border-white/20 bg-white/[0.06] px-6 py-6 sm:px-8 sm:py-7"
            style={{
              maxWidth: `${GRID_WIDTH}px`,
              marginLeft: "auto",
              marginRight: "auto",
              boxSizing: "border-box",
            }}
          >
            <p
              className="text-center"
              style={{
                fontFamily: "var(--font-bitter), serif",
                fontWeight: 500,
                fontSize: "20px",
                color: "rgba(255, 255, 255, 0.80)",
                lineHeight: 1.45,
                margin: 0,
              }}
            >
              Remember you can go to your library and upload photos to{" "}
              <InlineChip label="Custom group" />
              {" "}
              <InlineChip label="Other VIPs" />
              {" "}
              <InlineChip label="Artist / Musicians" />
              {" "}
              in order to use them during games.
            </p>
          </div>
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
          onClick={onContinue}
          disabled={selectedId !== "immediate-family"}
        >
          Continue
        </GamePrimaryButton>
      </div>
    </div>
  );
}

function InlineChip({ label }: { label: string }) {
  return (
    <span
      className="inline-block rounded-full align-middle"
      style={{
        fontFamily: "var(--font-bitter), serif",
        fontSize: "18px",
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.72)",
        background: "rgba(255, 255, 255, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        padding: "2px 10px",
        margin: "0 2px",
        verticalAlign: "middle",
        lineHeight: 1.35,
      }}
    >
      {label}
    </span>
  );
}
