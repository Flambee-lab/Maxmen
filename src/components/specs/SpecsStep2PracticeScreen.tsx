"use client";

import { useState, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PersonContentItem, PersonSubgroup } from "@/types/contentLibrary";
import { buildSubgroupLabelsNotInLibrary } from "@/lib/game/specsOptionsFromContent";
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

/** Mismo padding que SpecsScreen / TopHUD */
const HEADER_FOOTER_PADDING = 16;
const HEADER_FOOTER_PADDING_X = 24;

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

function IconStar() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7L2 9.4h7.6L12 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function iconForSubgroup(id: PersonSubgroup): ReactNode {
  switch (id) {
    case "immediate_family":
      return <IconFamily />;
    case "relatives":
      return <IconTheaterMasks />;
    case "friends":
      return <IconMusicNote />;
    case "custom_groups":
      return <IconStar />;
    case "other_vips":
      return <IconTheaterMasks />;
    case "artists_musicians":
      return <IconMusicNote />;
    default:
      return <IconFamily />;
  }
}

export interface SpecsSubgroupOption {
  id: PersonSubgroup;
  label: string;
}

interface SpecsStep2PracticeScreenProps {
  /** Subgrupos presentes en la biblioteca (personas) */
  subgroupOptions: SpecsSubgroupOption[];
  /** Todas las personas en la biblioteca (para calcular qué subgrupos aún no tienen fotos). */
  libraryPersons: PersonContentItem[];
  onContinue: (subgroup: PersonSubgroup) => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

/**
 * Specs paso 2 — un subgrupo de personas según datos cargados.
 */
export function SpecsStep2PracticeScreen({
  subgroupOptions,
  libraryPersons,
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
}: SpecsStep2PracticeScreenProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<PersonSubgroup | null>(null);

  const gridCols: 2 | 3 = subgroupOptions.length <= 2 ? 2 : 3;

  const subgroupsNotInLibraryYet = useMemo(
    () => buildSubgroupLabelsNotInLibrary(libraryPersons),
    [libraryPersons]
  );

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
          What would you like to refresh?
        </h1>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center overflow-y-auto overflow-x-hidden"
        style={{ zIndex: 1, padding: "24px 16px 120px" }}
      >
        <div
          className="flex w-full flex-col items-center justify-center"
          style={{ maxWidth: `${SPECS_CHIP_BLOCK_MAX_WIDTH_PX}px` }}
        >
          {subgroupOptions.length === 0 ? (
            <p
              className="text-center text-white/85"
              style={{
                fontFamily: "var(--font-bitter), serif",
                fontSize: "20px",
                maxWidth: "420px",
                lineHeight: 1.45,
              }}
            >
              No subgroup data in your library yet. Add people with a subgroup in
              Content, then try again.
            </p>
          ) : (
            <div style={getSpecsChipRowStyle(gridCols)}>
              {subgroupOptions.map((opt, index) => (
                <div
                  key={opt.id}
                  className="specs-option-enter"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <SpecsOption
                    label={opt.label}
                    icon={iconForSubgroup(opt.id)}
                    selected={selectedId === opt.id}
                    disabled={false}
                    onClick={() => {
                      setSelectedId((prev) => (prev === opt.id ? null : opt.id));
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {subgroupsNotInLibraryYet.length > 0 ? (
            <div
              className="mt-8 w-full px-2"
              style={{
                maxWidth: `${SPECS_CHIP_BLOCK_MAX_WIDTH_PX}px`,
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
                  fontSize: "14px",
                  letterSpacing: "0.02em",
                  color: "rgba(255, 255, 255, 0.42)",
                  lineHeight: 1.4,
                  margin: "0 0 10px 0",
                }}
              >
                You can add photos in Library for these groups too:
              </p>
              <div
                className="flex flex-wrap items-center justify-center gap-2"
                style={{ rowGap: "8px" }}
              >
                {subgroupsNotInLibraryYet.map((sg) => (
                  <span
                    key={sg.id}
                    className="inline-flex max-w-full items-center rounded-full"
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      lineHeight: 1.3,
                      color: "rgba(255, 255, 255, 0.48)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      background: "rgba(255, 255, 255, 0.04)",
                      padding: "4px 10px",
                    }}
                  >
                    {sg.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
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
          onClick={() => {
            if (selectedId) onContinue(selectedId);
          }}
          disabled={selectedId === null || subgroupOptions.length === 0}
        >
          Continue
        </SpecsContinueButton>
      </div>
    </div>
  );
}
