"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { BackButton } from "@/components/game/BackButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { SpecsOption } from "@/components/game/specs/SpecsOption";

interface SpecsScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

const SPECS_OPTIONS = [
  { id: "persons", label: "Persons" },
  { id: "plays", label: "Plays" },
  { id: "objects", label: "Objects" },
  { id: "specs", label: "Specs" },
  { id: "events", label: "Events" },
  { id: "others", label: "Others" },
] as const;

/** Mismo padding que TopHUD (py-4 px-6) */
const HEADER_FOOTER_PADDING = 16; // py-4
const HEADER_FOOTER_PADDING_X = 24; // px-6 = 24px

/**
 * Pantalla Specs: título/subtítulo, grid de selectores centrado en viewport, footer alineado al header.
 */
export function SpecsScreen({
  onContinue,
  onBack,
  isMuted = false,
  onMuteToggle = () => {},
}: SpecsScreenProps) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <>
      <div className="relative z-10 w-full min-h-screen overflow-hidden">
        {/* Header: Back (izq) + Sound + Close (der), misma altura */}
        {onBack && (
          <div
            className="absolute left-6 z-20"
            style={{ top: `${HEADER_FOOTER_PADDING}px` }}
          >
            <BackButton onClick={onBack} />
          </div>
        )}
        <div
          className="absolute right-6 z-20"
          style={{
            top: `${HEADER_FOOTER_PADDING}px`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <SoundButton isMuted={isMuted} onClick={onMuteToggle} />
          <CloseButton onClick={() => router.push("/")} />
        </div>

        {/* Título y subtítulo: arriba, no forman parte del centrado del grid */}
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
            Select your Focus Group or Groups
          </h1>
          <p
            className="w-full text-center"
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 500,
              fontSize: "24px",
              color: "rgba(255, 255, 255, 0.80)",
              lineHeight: 1.4,
            }}
          >
            Select up to 3 topics to play with.
          </p>
        </div>

        {/* Área central: grid de selectores centrado exactamente en el viewport (X e Y) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 1 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 320px)",
              gap: "16px",
              justifyItems: "center",
              alignItems: "center",
            }}
          >
            {SPECS_OPTIONS.map((opt) => (
              <SpecsOption
                key={opt.id}
                label={opt.label}
                selected={selectedOption === opt.label}
                onClick={() => setSelectedOption(opt.label)}
              />
            ))}
          </div>
        </div>

        {/* Footer HUD: TIP (abs left) | 1 of 3 (centro viewport) | Continue (abs right) */}
        <div
          className="absolute left-0 right-0 z-20 w-full"
          style={{
            bottom: 0,
            paddingBottom: "40px",
            minHeight: "68px",
          }}
        >
          <div className="relative w-full h-full" style={{ minHeight: "68px" }}>
            {/* Bloque izquierdo: TIP (absolute, centrado vertical en footer) */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              style={{
                paddingLeft: `${HEADER_FOOTER_PADDING_X}px`,
                maxWidth: "calc(100vw - 120px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "117px",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src="/intro/tip-icon.png"
                    alt=""
                    fill
                    sizes="100px"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 500,
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.80)",
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: "320px",
                  }}
                >
                  Turn topic sequences into sentences. It could make it easier to
                  remember them. For example: Madonna walked her dog Ollie to the
                  birthday party.
                </p>
              </div>
            </div>

            {/* Centro: 1 of 3 (centrado real viewport, no depende de los lados) */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <span
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.80)",
                }}
              >
                1 of 3
              </span>
            </div>

            {/* Bloque derecho: Continue (absolute, centrado vertical; ajuste fino si queda bajo) */}
            <div
              className="absolute right-0 top-1/2"
              style={{
                paddingRight: `${HEADER_FOOTER_PADDING_X}px`,
                transform: "translateY(-50%) translateY(-4px)",
              }}
            >
              <GamePrimaryButton onClick={onContinue}>
                Continue
              </GamePrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
