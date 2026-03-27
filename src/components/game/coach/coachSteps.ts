/**
 * Coach: 5 pasos de instrucciones antes del juego (Next avanza; el paso 1 es “Recognize”).
 * Sustituí título, subtítulo opcional y cuerpo de cada entrada cuando definas el copy.
 */
export const COACH_STEP_COUNT = 5;

/** Qué zona del tablero revela el spotlight en este paso */
export type CoachStepFocus = "cards" | "chips" | "connect" | "lightbulbs" | "pauseButton";

export type CoachStepContent = {
  title: string;
  /** Línea bajo el título (subtítulo) */
  subtitle?: string;
  body?: string;
  /** Default: cards */
  focus?: CoachStepFocus;
};

export const COACH_STEPS: readonly CoachStepContent[] = [
  {
    title: "Recognize",
    subtitle: "Look carefully at each image",
    focus: "cards",
  },
  {
    title: "Read",
    body: "Read all the answers carefully. There are more answers than images.",
    focus: "chips",
  },
  {
    title: "Connect",
    subtitle:
      "Match each answer to the correct image above. Tap an answer, then each image, or tap an image, then each answer.",
    focus: "connect",
  },
  {
    title: "Lightbulbs",
    body:
      "A passing score is 70%. If you make too many mistakes, a light bulb turns off. There will be several opportunities to turn a light back on to your memory.",
    focus: "lightbulbs",
  },
  {
    title: "Pause Button",
    body:
      "If you need to see instructions, restart a game or finish it, press the pause button.",
    focus: "pauseButton",
  },
] as const;
