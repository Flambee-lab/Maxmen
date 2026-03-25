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

const HEADER_FOOTER_PADDING = 16;
const HEADER_FOOTER_PADDING_X = 24;
const GRID_WIDTH = 320 * 3 + 16 * 2;

const CONTEXT_PILL_TEXT =
  "Immediate family, Friends & Neighbors, Artist / Musicians";

type TopicOptionId =
  | "name"
  | "relationships"
  | "birthday"
  | "job"
  | "lives-in"
  | "anniversary";

/** Únicas opciones clicables; las demás se muestran deshabilitadas (mismo layout que el diseño). */
const SELECTABLE_IDS: readonly TopicOptionId[] = [
  "name",
  "relationships",
  "birthday",
];

function isSelectableId(id: TopicOptionId): boolean {
  return SELECTABLE_IDS.includes(id);
}

const TOPIC_OPTIONS: {
  id: TopicOptionId;
  label: string;
  icon: ReactNode;
}[] = [
  { id: "name", label: "Name", icon: <IconFamily /> },
  { id: "relationships", label: "Relationships", icon: <IconTheaterMasks /> },
  { id: "birthday", label: "Birthday", icon: <IconMusicNote /> },
  { id: "job", label: "Job", icon: <IconLandscape /> },
  { id: "lives-in", label: "Lives In", icon: <IconVipTag /> },
  { id: "anniversary", label: "Anniversary", icon: <IconMusicNote /> },
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

/** Icono tipo imagen / paisaje (Job) */
function IconLandscape() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 17l5-4 4 3 4-5 5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVipTag() {
  return (
    <svg width={24} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 5h12l6 7-9 9-9-9V5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <text
        x="9"
        y="13"
        textAnchor="middle"
        fill="currentColor"
        style={{
          fontSize: "7px",
          fontFamily: "var(--font-bitter), serif",
          fontWeight: 700,
        }}
      >
        VIP
      </text>
    </svg>
  );
}

interface SpecsStep3TopicScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

/**
 * Specs paso 3 — textos y layout según diseño (tópicos / categorías).
 * Solo Name, Relationships y Birthday son clicables; Continue con al menos una de esas tres.
 */
export function SpecsStep3TopicScreen({
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
}: SpecsStep3TopicScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<TopicOptionId[]>([]);

  const toggle = (id: TopicOptionId) => {
    if (!isSelectableId(id)) return;
    setSelected((prev) => {
      const on = prev.includes(id);
      if (on) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const byId = Object.fromEntries(
    TOPIC_OPTIONS.map((o) => [o.id, o]),
  ) as Record<TopicOptionId, (typeof TOPIC_OPTIONS)[number]>;

  const canContinue = SELECTABLE_IDS.some((id) => selected.includes(id));

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
          What topic should we ask you about?
        </h1>
        <p
          className="w-full text-center"
          style={{
            fontFamily: "var(--font-bitter), serif",
            fontWeight: 500,
            fontSize: "24px",
            color: "rgba(255, 255, 255, 0.80)",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          Select 1 of 5
        </p>

        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
          style={{ maxWidth: `${GRID_WIDTH + 80}px` }}
        >
          <span
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 500,
              fontSize: "20px",
              color: "#FFFFFF",
            }}
          >
            for
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "48px",
              paddingLeft: "22px",
              paddingRight: "22px",
              borderRadius: "47.23px",
              border: "1px solid rgba(255, 255, 255, 0.55)",
              background: "rgba(255, 255, 255, 0.12)",
              boxShadow:
                "0 2px 0 0 rgba(255, 255, 255, 0.15) inset, 0 -2px 0 0 rgba(255, 255, 255, 0.2) inset",
              fontFamily: "var(--font-bitter), serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.95)",
              textAlign: "center",
              lineHeight: 1.35,
            }}
          >
            {CONTEXT_PILL_TEXT}
          </span>
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 1, padding: "24px 16px 120px", paddingTop: "clamp(200px, 28vh, 320px)" }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ maxWidth: `${GRID_WIDTH}px` }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 320px)",
              gap: "16px",
              justifyItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {(["name", "relationships", "birthday"] as const).map((id, index) => {
              const opt = byId[id];
              return (
                <div
                  key={id}
                  className="specs-option-enter"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <SpecsOption
                    label={opt.label}
                    icon={opt.icon}
                    selected={selected.includes(id)}
                    disabled={!isSelectableId(id)}
                    onClick={() => toggle(id)}
                  />
                </div>
              );
            })}
            {(["job", "lives-in", "anniversary"] as const).map((id, index) => {
              const opt = byId[id];
              return (
                <div
                  key={id}
                  className="specs-option-enter"
                  style={{ animationDelay: `${(index + 3) * 70}ms` }}
                >
                  <SpecsOption
                    label={opt.label}
                    icon={opt.icon}
                    selected={false}
                    disabled
                    onClick={() => toggle(id)}
                  />
                </div>
              );
            })}
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
          disabled={!canContinue}
        >
          Continue
        </GamePrimaryButton>
      </div>
    </div>
  );
}
