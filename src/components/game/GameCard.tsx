"use client";

import Image from "next/image";
import { ConnectorArrow } from "./ConnectorArrow";

interface GameCardProps {
  imageSrc: string;
  alt?: string;
  cardId: string;
  cardStatus?: "correct" | "incorrect" | "idle";
  resolvedChipName?: string; // Nombre del chip resuelto en esta card
  cardFeedback?: "idle" | "incorrect" | "correct"; // Feedback temporal
  connectSlotRef?: (cardId: string, element: HTMLDivElement | null) => void;
  /** Cuando false (modo chip → card activo), no se muestra la flecha debajo del connect slot */
  showSlotArrow?: boolean;
  /** Opacidad de la flecha del slot: 0.2 idle, 1 cuando esta card es el origen activo */
  slotArrowOpacity?: number;
  /** Cuando true (card es origen en modo card→chip), no se dibuja la flecha estática para no duplicar con el overlay */
  isOriginActive?: boolean;
  /** Permite mostrar el connect slot aunque exista resolvedChipName (uso visual en Round 2/3) */
  showConnectSlotWhenResolved?: boolean;
  /** Texto secundario embebido en el name container (Round 2/3) */
  relationshipLabel?: string;
  /** Si true (default), antepone "is my …" al relationshipLabel (relaciones entre personas). */
  relationshipLabelPossessive?: boolean;
  /** Si true, mantiene visible el conector aun con relationshipLabel (Round 3) */
  keepConnectorWhenRelationship?: boolean;
  /** Offset vertical extra para conector en estado resuelto */
  resolvedConnectorExtraOffsetPx?: number;
  /** Texto embebido para Round 3 correcto (birth date) */
  birthDateLabel?: string;
  /** Solo foto (intro previa a ronda 1): sin connect slot ni elementos extra */
  photosOnly?: boolean;
  /** Pantalla final de victoria (resultados): sin conector bajo la foto */
  hideConnectSlot?: boolean;
  /** Ronda actual (1–3): visibilidad del slot con nametag apilado */
  round?: 1 | 2 | 3;
  /**
   * Contenido del nametag acumulado por rondas (orden = orden de selección en Specs paso 3).
   * Si está definido (incluido []), sustituye el layout fijo name + relationship + birthday.
   */
  cardContentLines?: string[];
}

const CARD_SIZE = 208;
const CARD_RADIUS = 16;
const CONNECT_SLOT_SIZE = 48;
const INNER_CIRCLE_SIZE = 28;
const INNER_CIRCLE_BORDER = 2;
const INCORRECT_ICON_SIZE = 88;
const CORRECT_ICON_SIZE = 88;
const NAME_TAG_WIDTH = 192;
const NAME_TAG_PADDING = 18;
const NAME_TAG_RADIUS = 16;
const NAME_TAG_BORDER = 2;

export function GameCard({
  imageSrc,
  alt = "Card",
  cardId,
  cardStatus = "idle",
  resolvedChipName,
  cardFeedback = "idle",
  connectSlotRef,
  showSlotArrow = true,
  slotArrowOpacity = 0.2,
  isOriginActive = false,
  showConnectSlotWhenResolved = false,
  relationshipLabel,
  relationshipLabelPossessive = true,
  keepConnectorWhenRelationship = false,
  resolvedConnectorExtraOffsetPx = 0,
  birthDateLabel,
  photosOnly = false,
  hideConnectSlot = false,
  cardContentLines,
  round,
}: GameCardProps) {
  const isIncorrect = cardFeedback === "incorrect";
  const isCorrectFeedback = cardFeedback === "correct";
  /** Solo modo apilado cuando hay líneas reales; `[]` no debe anular el nametag legacy */
  const useDynamicNametag =
    cardContentLines !== undefined && cardContentLines.length > 0;
  const isResolvedLegacy = !!resolvedChipName;
  const hasDynamicNametag = useDynamicNametag;
  const hasLegacyNametag = !useDynamicNametag && isResolvedLegacy;
  /** Con stack dinámico, el slot depende de la ronda y de qué falta conectar (no del nombre prefijado en r2/3) */
  const showConnectSlotDynamic =
    useDynamicNametag &&
    round != null &&
    (round === 1
      ? !resolvedChipName
      : round === 2
        ? !relationshipLabel
        : !birthDateLabel);
  const connectSlotBelowNametag = useDynamicNametag
    ? hasDynamicNametag && showConnectSlotWhenResolved && showConnectSlotDynamic
    : isResolvedLegacy && showConnectSlotWhenResolved;

  return (
    <div
      className="relative"
      style={{
        width: `${CARD_SIZE}px`,
        height: `${CARD_SIZE}px`,
      }}
    >
      {/* Contenedor solo de la foto: imagen + overlays correcto/incorrecto. El círculo (connect slot) queda fuera y por encima. */}
      <div
        className="relative"
        style={{
          width: `${CARD_SIZE}px`,
          height: `${CARD_SIZE}px`,
          borderRadius: `${CARD_RADIUS}px`,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          width={CARD_SIZE}
          height={CARD_SIZE}
          style={{
            width: `${CARD_SIZE}px`,
            height: `${CARD_SIZE}px`,
            borderRadius: `${CARD_RADIUS}px`,
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Overlay de estado incorrecto (fade-in suave); solo sobre la foto, por detrás del círculo */}
        {isIncorrect && (
          <>
            <div
              className="game-overlay-fade-in absolute inset-0 pointer-events-none"
              style={{
                borderRadius: `${CARD_RADIUS}px`,
                border: "1px solid #F6743E",
                background: "rgba(212, 37, 37, 0.10)",
                boxShadow: "0 0 84px 0 #D42525 inset",
                zIndex: 1,
              }}
            />
            <div
              className="game-overlay-fade-in absolute pointer-events-none flex items-center justify-center"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${INCORRECT_ICON_SIZE}px`,
                height: `${INCORRECT_ICON_SIZE}px`,
                zIndex: 2,
              }}
            >
              <Image
                src="/assets/incorrect-icon.png"
                alt=""
                width={INCORRECT_ICON_SIZE}
                height={INCORRECT_ICON_SIZE}
                style={{
                  width: `${INCORRECT_ICON_SIZE}px`,
                  height: `${INCORRECT_ICON_SIZE}px`,
                  display: "block",
                }}
              />
            </div>
          </>
        )}

        {/* Overlay de estado correcto (feedback temporal, fade-in suave); solo sobre la foto, por detrás del círculo */}
        {isCorrectFeedback && (
          <>
            <div
              className="game-overlay-fade-in absolute inset-0 pointer-events-none"
              style={{
                borderRadius: `${CARD_RADIUS}px`,
                border: "1px solid rgba(0, 142, 65, 0.40)",
                background: "rgba(0, 142, 65, 0.10)",
                boxShadow: "0 0 84px 0 #32BB71 inset",
                zIndex: 1,
              }}
            />
            <div
              className="game-overlay-fade-in absolute pointer-events-none flex items-center justify-center"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${CORRECT_ICON_SIZE}px`,
                height: `${CORRECT_ICON_SIZE}px`,
                zIndex: 2,
              }}
            >
              <Image
                src="/assets/correct-icon.png"
                alt=""
                width={CORRECT_ICON_SIZE}
                height={CORRECT_ICON_SIZE}
                style={{
                  width: `${CORRECT_ICON_SIZE}px`,
                  height: `${CORRECT_ICON_SIZE}px`,
                  display: "block",
                }}
              />
            </div>
          </>
        )}
      </div>

      {hasDynamicNametag && !photosOnly ? (
        <div
          className="game-nametag-enter absolute pointer-events-none"
          style={{
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%) translateY(50%)",
            display: "flex",
            flexDirection: "column",
            width: `${NAME_TAG_WIDTH}px`,
            padding: `${NAME_TAG_PADDING}px`,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: `${NAME_TAG_RADIUS}px`,
            border: `${NAME_TAG_BORDER}px solid rgba(255, 255, 255, 0.20)`,
            background: "#284B79",
            zIndex: 3,
          }}
        >
          {cardContentLines!.map((line, i) => (
            <span
              key={`${i}-${line.slice(0, 24)}`}
              style={{
                marginTop: i > 0 ? "12px" : 0,
                fontFamily: "var(--font-bitter), serif",
                fontWeight: 600,
                fontSize: i === 0 ? "24px" : "18px",
                color: i === 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.85)",
                textAlign: "center",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              {line}
            </span>
          ))}
        </div>
      ) : hasLegacyNametag && !photosOnly ? (
        /* NameTag legacy (mocks sin cardContentLines) */
        <div
          className="game-nametag-enter absolute pointer-events-none"
          style={{
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%) translateY(50%)",
            display: "flex",
            flexDirection: "column",
            width: `${NAME_TAG_WIDTH}px`,
            padding: `${NAME_TAG_PADDING}px`,
            ...(birthDateLabel ? { paddingBottom: "16px" } : undefined),
            ...(birthDateLabel ? { overflow: "hidden" } : undefined),
            justifyContent: "center",
            alignItems: "center",
            borderRadius: `${NAME_TAG_RADIUS}px`,
            border: `${NAME_TAG_BORDER}px solid rgba(255, 255, 255, 0.20)`,
            background: "#284B79",
            zIndex: 3,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-bitter), serif",
              fontWeight: 600,
              fontSize: "24px",
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {resolvedChipName}
          </span>
          {relationshipLabel && (
            <span
              style={{
                marginTop: "12px",
                fontFamily: "var(--font-bitter), serif",
                fontWeight: 600,
                fontSize: "18px",
                color: "rgba(255, 255, 255, 0.60)",
                textAlign: "center",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              {relationshipLabelPossessive
                ? `is my ${relationshipLabel}`
                : relationshipLabel}
            </span>
          )}
          {birthDateLabel && (
            <>
              <div style={{ height: "16px" }} />
              <div
                aria-hidden="true"
                style={{
                  width: "100%",
                  marginLeft: `-${NAME_TAG_PADDING}px`,
                  marginRight: `-${NAME_TAG_PADDING}px`,
                  height: "1px",
                  background: "rgba(255, 255, 255, 0.20)",
                }}
              />
              <div style={{ height: "16px" }} />
              <span
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.80)",
                  textAlign: "center",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {birthDateLabel}
              </span>
            </>
          )}
        </div>
      ) : null}

      {!photosOnly &&
        !hideConnectSlot &&
        (useDynamicNametag
          ? showConnectSlotDynamic
          : (!isResolvedLegacy ||
              (showConnectSlotWhenResolved &&
                (!relationshipLabel || keepConnectorWhenRelationship))) &&
            !birthDateLabel) && (
        /* Connect slot cuando NO está resuelta o cuando se solicita mostrarlo bajo NameTag */
        <div
          ref={(el) => {
            if (connectSlotRef) {
              connectSlotRef(cardId, el);
            }
          }}
          data-connect-slot="true"
          data-card-id={cardId}
          data-target-id={cardId}
          className="absolute"
          style={{
            left: "50%",
            bottom: 0,
            transform: connectSlotBelowNametag
                ? `translateX(-50%) translateY(calc(102% + 8px + ${resolvedConnectorExtraOffsetPx}px))`
                : "translateX(-50%) translateY(50%)",
            width: `${CONNECT_SLOT_SIZE}px`,
            height: `${CONNECT_SLOT_SIZE}px`,
            borderRadius: "9999px",
            backgroundColor: "#284B79",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: `${INNER_CIRCLE_SIZE}px`,
              height: `${INNER_CIRCLE_SIZE}px`,
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.20)",
              border: `${INNER_CIRCLE_BORDER}px solid #FFFFFF`,
            }}
          />
          {/* Flecha estática debajo del connect slot para modo card → chip (oculta cuando modo chip activo o cuando esta card es el origen) */}
          {showSlotArrow && !isOriginActive && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%) rotate(180deg)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <ConnectorArrow height={32} opacity={slotArrowOpacity} />
          </div>
          )}
        </div>
      )}
    </div>
  );
}
