"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { BackButton } from "@/components/game/BackButton";
import { SpecsContinueButton } from "@/components/specs/SpecsContinueButton";
import { SpecsOption } from "@/components/game/specs/SpecsOption";
import {
  SPECS_PRIMARY_ACTION_BOTTOM_PX,
  SPECS_PRIMARY_ACTION_RIGHT_PX,
} from "@/components/specs/specsFooterConstants";
import {
  SPECS_CHIP_BLOCK_MAX_WIDTH_PX,
  getSpecsChipRowStyle,
} from "@/components/specs/specsChipLayout";
import { MAX_GAME_ROUNDS } from "@/lib/game/buildPersonGameLibrary";

const HEADER_FOOTER_PADDING = 16;
const HEADER_FOOTER_PADDING_X = 24;

/** Máximo de question types en paso 3 = máximo de rondas en partida */
export const MAX_QUESTION_SELECTIONS = MAX_GAME_ROUNDS;

export type TopicOptionId = string;

function iconForQuestionId(id: string): ReactNode {
  const q =
    id.includes("::") && id.split("::").length >= 2 ? id.split("::")[1]! : id;
  if (q === "name" || q === "spouse_name" || q === "children_names") {
    return <IconFamily />;
  }
  if (
    q === "relationships" ||
    q === "occupation" ||
    q === "show_appearances"
  ) {
    return <IconTheaterMasks />;
  }
  if (
    q === "birthday" ||
    q === "anniversary" ||
    q === "event_type" ||
    q === "event_for_who" ||
    q === "event_for_what"
  ) {
    return <IconMusicNote />;
  }
  if (q === "lives_in" || q === "specific_location") {
    return <IconVipTag />;
  }
  if (q === "purpose" || q === "description" || q === "breed_or_type") {
    return <IconLandscape />;
  }
  return <IconFamily />;
}

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

export interface QuestionOption {
  id: string;
  label: string;
}

interface SpecsStep3TopicScreenProps {
  /** Solo entradas con data en el pool actual */
  questionOptions: QuestionOption[];
  onContinue: (selected: TopicOptionId[]) => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  focusContextPillText?: string;
}

/**
 * Specs paso 3 — tipos de pregunta según datos cargados (sin opciones vacías).
 */
export function SpecsStep3TopicScreen({
  questionOptions,
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
  focusContextPillText = "Your focus groups",
}: SpecsStep3TopicScreenProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<TopicOptionId[]>([]);

  /**
   * Orden = orden de selección: 1.ª → Round 1, 2.ª → Round 2, 3.ª → Round 3.
   * Máximo 3 tipos (= 3 rondas).
   */
  const toggle = (id: TopicOptionId) => {
    setSelected((prev) => {
      const on = prev.includes(id);
      if (on) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_GAME_ROUNDS) return prev;
      return [...prev, id];
    });
  };

  const atMaxSelections = selected.length >= MAX_GAME_ROUNDS;

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
          What should we ask you about?
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
          Select up to {MAX_GAME_ROUNDS}
        </p>

        {/* Contexto del paso anterior: contenedor suave (no mismo lenguaje que los chips clicables) */}
        <div
          className="mt-5 mx-auto text-center"
          style={{
            maxWidth: "min(560px, 92vw)",
            padding: "10px 18px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            cursor: "default",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: 1.45,
              margin: 0,
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>for </span>
            <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {focusContextPillText}
            </span>
          </p>
        </div>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 1, padding: "24px 16px 120px", paddingTop: "clamp(200px, 28vh, 320px)" }}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ maxWidth: `${SPECS_CHIP_BLOCK_MAX_WIDTH_PX}px` }}
        >
          {questionOptions.length === 0 ? (
            <p
              className="text-center text-white/80"
              style={{ fontFamily: "var(--font-bitter), serif", fontSize: "20px" }}
            >
              No question types available for this selection. Add more fields in
              Content or adjust your focus.
            </p>
          ) : (
            <div style={getSpecsChipRowStyle(3)}>
              {questionOptions.map((opt, index) => {
                const isSelected = selected.includes(opt.id);
                const disabled = atMaxSelections && !isSelected;
                return (
                  <div
                    key={opt.id}
                    className="specs-option-enter"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <SpecsOption
                      label={opt.label}
                      icon={iconForQuestionId(opt.id)}
                      selected={isSelected}
                      disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        toggle(opt.id);
                      }}
                    />
                  </div>
                );
              })}
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
        <SpecsContinueButton
          onClick={() => onContinue(selected)}
          disabled={!canContinue || questionOptions.length === 0}
        >
          Continue
        </SpecsContinueButton>
      </div>
    </div>
  );
}
