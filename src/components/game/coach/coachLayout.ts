/**
 * Layout del Coach alineado con GameScreen en modo play (main + instrucción + cards + chips).
 * Usado para posicionar el spotlight sobre las fotos sin números mágicos sueltos en dos archivos.
 */
export const COACH_LAYOUT = {
  /** TopHUD: py-4 + Timer ~60px */
  topHudPx: 92,
  mainMarginTopPx: 58,
  /** ~1 línea del GameInstruction (32px); debe coincidir con el placeholder invisible en CoachGamePreview */
  instructionOneLinePx: 44,
  canvasMarginTopPx: 32,
} as const;

/** Distancia desde el borde superior del viewport hasta el inicio del bloque CardStage */
export const COACH_CARD_STAGE_TOP_PX =
  COACH_LAYOUT.topHudPx +
  COACH_LAYOUT.mainMarginTopPx +
  COACH_LAYOUT.instructionOneLinePx +
  COACH_LAYOUT.canvasMarginTopPx;

/** Ancho de una GameCard en play */
export const COACH_CARD_WIDTH_PX = 208;
/** Gap horizontal entre cards en CardStage */
export const COACH_CARD_GAP_PX = 20;
/**
 * Offset desde el borde izquierdo del bloque de 3 cards (664px) hasta el borde izquierdo de la card del medio.
 */
export const COACH_MIDDLE_CARD_LEFT_OFFSET_PX = COACH_CARD_WIDTH_PX + COACH_CARD_GAP_PX;

/** 3×208 + 2×20 (gap CardStage) */
export const COACH_SPOTLIGHT_WIDTH_PX = 664;
/**
 * Foto (208) + mitad inferior del connect slot (GameCard: círculo 48px centrado en el borde inferior
 * de la foto → +24px hacia abajo) + un poco de aire para no recortar el borde del círculo.
 */
const CARD_IMAGE_PX = COACH_CARD_WIDTH_PX;
const CONNECT_SLOT_PX = 48;
const CONNECT_SLOT_HALF_BELOW_PHOTO = CONNECT_SLOT_PX / 2;
const SPOTLIGHT_VERTICAL_PADDING = 6;
export const COACH_SPOTLIGHT_HEIGHT_PX =
  CARD_IMAGE_PX + CONNECT_SLOT_HALF_BELOW_PHOTO + SPOTLIGHT_VERTICAL_PADDING;
export const COACH_SPOTLIGHT_RADIUS_PX = 16;
/** Aire entre el halo de foco y el contenido (cards, chips, HUD) */
export const COACH_SPOTLIGHT_FOCUS_PADDING_PX = 16;

/** Altura del bloque CardStage (foto + slot + flecha bajo slot), alineada con CoachGamePreview */
export const COACH_CARD_STAGE_HEIGHT_PX = 264;

/** Mismo gap que CoachGamePreview entre CardStage y ChipRow */
export const COACH_CHIPS_MARGIN_TOP_PX = 160;

/** Top del contenedor ChipRow (borde superior del área de chips en el flujo) */
export const COACH_CHIP_ROW_TOP_PX =
  COACH_CARD_STAGE_TOP_PX + COACH_CARD_STAGE_HEIGHT_PX + COACH_CHIPS_MARGIN_TOP_PX;

/** Flecha encima de cada chip (ConnectorArrow) */
const CHIP_ARROW_ABOVE_PX = 32;
const CHIP_OUTER_HEIGHT_PX = 76;
const CHIP_SPOTLIGHT_PAD_PX = 8;

/** Spotlight chips: incluye flechas + pastillas (como en la referencia) */
export const COACH_CHIP_SPOTLIGHT_TOP_PX = COACH_CHIP_ROW_TOP_PX - CHIP_ARROW_ABOVE_PX;
export const COACH_CHIP_SPOTLIGHT_HEIGHT_PX =
  CHIP_ARROW_ABOVE_PX + CHIP_OUTER_HEIGHT_PX + CHIP_SPOTLIGHT_PAD_PX;
/** Ancho suficiente para 3 chips con nombres largos + gaps */
export const COACH_CHIP_SPOTLIGHT_WIDTH_PX = 720;
/** Paso Connect: ancho del marco de iluminación sobre el chip Tom (solo borde; el chip lo pinta el preview) */
export const COACH_CONNECT_SINGLE_CHIP_SPOTLIGHT_WIDTH_PX = 240;
/**
 * Paso Connect: desplazamiento del centro del chip Tom respecto al centro del viewport (px).
 * Fila de 4 chips centrada: Tom (2.º) queda un poco a la izquierda del centro.
 */
export const COACH_CONNECT_CHIP_CENTER_OFFSET_FROM_VIEWPORT_CENTER_PX = -12;

/** Fila de Lives en TopHUD (5×68px, solape −32px entre ítems) — ancho total */
export const COACH_LIVES_ROW_WIDTH_PX = 68 * 5 + (-32) * 4;
/** Alto aproximado de la fila de lámparas (escala 1.15) */
export const COACH_LIVES_ROW_HEIGHT_PX = 80;

/** Botón pausa (GameSecondaryIconButton): mismo tamaño que SoundButton en TopHUD */
export const COACH_PAUSE_BUTTON_SIZE_PX = 60;

/** Gap entre el borde inferior del cartel y el borde superior del spotlight de chips */
export const COACH_POPUP_GAP_ABOVE_CHIPS_PX = 12;

/** Alto del bloque ChipRow (flechas + pastillas) para placeholder cuando omitChips en el preview */
export const COACH_CHIP_ROW_PLACEHOLDER_HEIGHT_PX = 112;
