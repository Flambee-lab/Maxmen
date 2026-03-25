"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SoundButton } from "@/components/game/SoundButton";
import { CloseButton } from "@/components/game/CloseButton";
import { BackButton } from "@/components/game/BackButton";
import { GamePrimaryButton } from "@/components/game/GamePrimaryButton";
import { SpecsOption } from "@/components/game/specs/SpecsOption";
import {
  SPECS_PRIMARY_ACTION_BOTTOM_PX,
  SPECS_PRIMARY_ACTION_RIGHT_PX,
} from "@/components/specs/specsFooterConstants";

interface SpecsScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  /** Texto arriba */
  title?: string;
  /** Texto descriptivo debajo del título */
  subtitle?: string;
  /** Lista de opciones para el grid (reutiliza layout existente) */
  options?: ReadonlyArray<{ id: string; label: string }>;
  /** Selecciones máximas por paso */
  maxSelectable?: number;
  /**
   * Si se define, solo esa opción (por `label`) es clicable; el resto queda deshabilitada.
   * Continue solo se habilita cuando esa opción está seleccionada (una sola selección válida).
   */
  onlySelectableLabel?: string;
  /** Muestra una píldora de contexto bajo el subtítulo (p. ej. "Persons" en el paso de refinamiento). */
  focusContextLabel?: string;
  /** Texto del bloque TIP (footer izquierdo). Si no se pasa, se usa el copy por defecto del paso 1. */
  tipText?: string;
  /** Etiqueta sobre el párrafo TIP (Figma: "TIP"). */
  tipLabel?: string;
  /**
   * Replica el botón "Start Random game" del diseño (invisible / no interactivo), debajo de Continue.
   */
  showStartRandomGamePlaceholder?: boolean;
  /** Columnas del grid de opciones (Figma puede usar 2 o 3). */
  gridColumns?: 2 | 3;
  /**
   * `center`: grid centrado en el viewport (paso 1).
   * `belowHeader`: grid debajo del bloque título/subtítulo/píldora (paso 2, grid más alto 2×3).
   */
  contentLayout?: "center" | "belowHeader";
  /** Para el HUD: X of Y */
  stepNumber?: number;
  totalSteps?: number;
  /** Si es false, no se muestra el texto central "1 of 3" (etc.). */
  showStepIndicator?: boolean;
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
  title = "Select your Focus Group or Groups",
  subtitle = "Select up to 3 topics to play with.",
  options = SPECS_OPTIONS,
  maxSelectable = 3,
  onlySelectableLabel,
  focusContextLabel,
  tipText,
  tipLabel,
  showStartRandomGamePlaceholder = false,
  gridColumns = 3,
  contentLayout = "center",
  stepNumber = 1,
  totalSteps = 3,
  showStepIndicator = true,
}: SpecsScreenProps) {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const tipBody =
    tipText ??
    "Turn topic sequences into sentences. It could make it easier to remember them. For example: Madonna walked her dog Ollie to the birthday party.";

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
            {title}
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
            {subtitle}
          </p>
          {focusContextLabel ? (
            <div
              className="flex flex-wrap justify-center gap-2"
              style={{ marginTop: "20px" }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "48px",
                  paddingLeft: "28px",
                  paddingRight: "28px",
                  borderRadius: "47.23px",
                  border: "4px solid #101665",
                  background: "rgba(16, 22, 101, 0.35)",
                  boxShadow:
                    "0 3px 0 0 rgba(255, 255, 255, 0.2) inset, 0 -3px 0 0 rgba(255, 255, 255, 0.35) inset",
                  fontFamily: "var(--font-bitter), serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                }}
              >
                {focusContextLabel}
              </span>
            </div>
          ) : null}
        </div>

        {/* Área central: grid centrado en viewport o anclado bajo el header (Figma specs 2) */}
        <div
          className="absolute inset-0 flex justify-center overflow-y-auto overflow-x-hidden"
          style={{
            zIndex: 1,
            alignItems: contentLayout === "belowHeader" ? "flex-start" : "center",
            paddingTop:
              contentLayout === "belowHeader"
                ? "clamp(200px, 26vh, 300px)"
                : undefined,
            paddingBottom:
              contentLayout === "belowHeader" ? "min(28vh, 220px)" : undefined,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridColumns}, 320px)`,
              gap: "16px",
              justifyItems: "center",
              alignItems: "center",
            }}
          >
            {options.map((opt, index) => (
              <div
                key={opt.id}
                className="specs-option-enter"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <SpecsOption
                  label={opt.label}
                  selected={selectedOptions.includes(opt.label)}
                  disabled={
                    onlySelectableLabel !== undefined &&
                    opt.label !== onlySelectableLabel
                  }
                  onClick={() => {
                    if (
                      onlySelectableLabel !== undefined &&
                      opt.label !== onlySelectableLabel
                    ) {
                      return;
                    }
                    setSelectedOptions((prev) => {
                      if (onlySelectableLabel !== undefined) {
                        const isSelected = prev.includes(opt.label);
                        return isSelected ? [] : [onlySelectableLabel];
                      }
                      const isSelected = prev.includes(opt.label);
                      if (isSelected) {
                        return prev.filter((label) => label !== opt.label);
                      }
                      if (prev.length >= maxSelectable) {
                        return prev;
                      }
                      return [...prev, opt.label];
                    });
                  }}
                />
              </div>
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
                  position: "relative",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div className="specs-tip-halo" aria-hidden="true" />
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
                <div style={{ maxWidth: "320px" }}>
                  {tipLabel ? (
                    <p
                      style={{
                        fontFamily: "var(--font-bitter), serif",
                        fontWeight: 700,
                        fontSize: "16px",
                        color: "rgba(255, 255, 255, 0.95)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        margin: "0 0 8px 0",
                      }}
                    >
                      {tipLabel}
                    </p>
                  ) : null}
                  <p
                    style={{
                      fontFamily: "var(--font-bitter), serif",
                      fontWeight: 500,
                      fontSize: "18px",
                      color: "rgba(255, 255, 255, 0.80)",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {tipBody}
                  </p>
                </div>
              </div>
            </div>

            {/* Centro: X of Y (opcional) */}
            {showStepIndicator ? (
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <span
                  style={{
                    fontFamily: "var(--font-bitter), serif",
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.80)",
                  }}
                >
                  {stepNumber} of {totalSteps}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Continue: misma posición que Specs 2 y 3 (no flex con placeholder que desplace el botón) */}
        <div
          className="absolute z-20"
          style={{
            right: `${SPECS_PRIMARY_ACTION_RIGHT_PX}px`,
            bottom: `${SPECS_PRIMARY_ACTION_BOTTOM_PX}px`,
          }}
        >
          <div className="relative">
            <GamePrimaryButton
              onClick={onContinue}
              disabled={
                onlySelectableLabel !== undefined
                  ? !selectedOptions.includes(onlySelectableLabel)
                  : selectedOptions.length < 1
              }
            >
              Continue
            </GamePrimaryButton>
            {showStartRandomGamePlaceholder ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: "100%",
                  marginTop: "12px",
                  width: "320px",
                  height: "68px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-bitter), serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                Start Random game
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
