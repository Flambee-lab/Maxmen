"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GameState } from "@/types/game";
import { mockCards, mockChips } from "@/mocks/gameMocks";
import { Background } from "./Background";
import { TopHUD } from "./TopHUD";
import { GameInstruction } from "./GameInstruction";
import { CardStage } from "./CardStage";
import { ChipRow } from "./ChipRow";
import { RevealAnswersButton } from "./RevealAnswersButton";
import { PauseMenu } from "./PauseMenu";
import { SuccessScreen } from "./SuccessScreen";
import { DragArrowOverlay } from "./DragArrowOverlay";
import { GamePrimaryButton } from "./GamePrimaryButton";
import Image from "next/image";

interface DragState {
  nameId: string;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
}

type GameMode = "play" | "reveal";

interface GameScreenProps {
  /** Si true, no renderiza Background (lo provee GameContainer) */
  skipBackground?: boolean;
}

/** Mapping correcto: chipName -> cardId */
const CORRECT_MAPPING: Record<string, string> = {
  // Orden físico de izquierda a derecha:
  // card-1 (primera izquierda), card-2 (segunda izquierda),
  // card-3 (segunda derecha), card-4 (extremo derecho)
  Tom: "card-1",
  Ian: "card-2",
  Catherine: "card-3",
  // Tanto "Justin" (nombre real del chip en mocks) como "Justine" (label esperado)
  // deben ser correctos solo para la card más a la derecha.
  Justin: "card-4",
  Justine: "card-4",
};

const INCORRECT_RESET_DELAY = 5000; // 5 segundos
const CORRECT_FEEDBACK_DELAY = 5000; // 5 segundos

export function GameScreen({ skipBackground = false }: GameScreenProps = {}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardStatus, setCardStatus] = useState<Record<string, "correct" | "incorrect" | "idle">>({});
  const [resolvedByCard, setResolvedByCard] = useState<Record<string, string>>({}); // cardId -> chipName
  const [cardFeedback, setCardFeedback] = useState<Record<string, "idle" | "incorrect" | "correct">>({}); // cardId -> feedback temporal
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<GameMode>("play");
  const connectSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const resetTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});
  const correctFeedbackTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    lives: 5,
    isPaused: false,
    isMuted: false,
    selectedCardId: null,
    selectedChipId: null,
    hoveredNameId: null,
    draggingNameId: null,
    dragState: null,
    cards: mockCards,
    chips: mockChips,
    connections: [],
    showSuccess: false,
  });

  const [dragState, setDragState] = useState<DragState | null>(null);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
    // Mantener gameState.isPaused sincronizado por si otros sistemas lo usan
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const handleMuteToggle = () => {
    setGameState((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
    }));
  };

  const handleChipHover = useCallback((nameId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      hoveredNameId: nameId,
    }));
  }, []);

  const registerConnectSlot = useCallback(
    (cardId: string, element: HTMLDivElement | null) => {
      if (element) {
        connectSlotsRef.current.set(cardId, element);
      } else {
        connectSlotsRef.current.delete(cardId);
      }
    },
    []
  );

  const registerChipRef = useCallback(
    (nameId: string, element: HTMLDivElement | null) => {
      if (element) {
        chipRefs.current.set(nameId, element);
      } else {
        chipRefs.current.delete(nameId);
      }
    },
    []
  );

  const handleArrowPointerDown = useCallback(
    (nameId: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const chipElement = chipRefs.current.get(nameId);
      if (!chipElement) return;

      const chipRect = chipElement.getBoundingClientRect();
      const originX = chipRect.left + chipRect.width / 2;
      const originY = chipRect.top;

      const initialPointerX = e.clientX;
      const initialPointerY = e.clientY;

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const newDragState: DragState = {
        nameId,
        originX,
        originY,
        pointerX: initialPointerX,
        pointerY: initialPointerY,
      };

      dragStateRef.current = newDragState;
      setDragState(newDragState);
      setGameState((prev) => ({
        ...prev,
        draggingNameId: nameId,
      }));
      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!dragStateRef.current) return;

        // Clamp la punta de la flecha al área del canvas (cards + slots)
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        let clampedX = moveEvent.clientX;
        let clampedY = moveEvent.clientY;

        if (canvasRect) {
          clampedX = Math.min(Math.max(moveEvent.clientX, canvasRect.left), canvasRect.right);
          clampedY = Math.min(Math.max(moveEvent.clientY, canvasRect.top), canvasRect.bottom);
        }

        // Detectar card bajo la punta de la flecha para highlight en drag
        let hoveredCardId: string | null = null;
        const elementAtPoint = document.elementFromPoint(clampedX, clampedY);
        if (elementAtPoint) {
          const targetElement = elementAtPoint.closest('[data-target-id]') as HTMLElement | null;
          if (targetElement) {
            const targetId = targetElement.getAttribute("data-target-id");
            if (targetId && targetId.startsWith("card-")) {
              // Solo highlight si la card no está resuelta
              if (!resolvedByCard[targetId]) {
                hoveredCardId = targetId;
              }
            }
          }
        }
        setActiveCardId(hoveredCardId);

        dragStateRef.current = {
          ...dragStateRef.current,
          pointerX: clampedX,
          pointerY: clampedY,
        };

        setDragState({
          ...dragStateRef.current,
        });
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        // Usar las coordenadas clampadas del último movimiento
        const dropX = dragStateRef.current?.pointerX ?? upEvent.clientX;
        const dropY = dragStateRef.current?.pointerY ?? upEvent.clientY;

        // Detectar si cayó sobre una card o connect slot usando elementFromPoint
        const elementAtDrop = document.elementFromPoint(dropX, dropY);
        let droppedCardId: string | null = null;

        if (elementAtDrop) {
          // Buscar data-target-id hacia arriba en el DOM
          const targetElement = elementAtDrop.closest('[data-target-id]') as HTMLElement;
          if (targetElement) {
            const targetId = targetElement.getAttribute('data-target-id');
            if (targetId && targetId.startsWith('card-')) {
              droppedCardId = targetId;
            }
          }
        }

        // Fallback: verificar connect slots por bounding rect (por si elementFromPoint falla)
        if (!droppedCardId) {
          for (const [cardId, slotElement] of connectSlotsRef.current.entries()) {
            const rect = slotElement.getBoundingClientRect();
            if (
              dropX >= rect.left &&
              dropX <= rect.right &&
              dropY >= rect.top &&
              dropY <= rect.bottom
            ) {
              droppedCardId = cardId;
              break;
            }
          }
        }

        if (droppedCardId) {
          // Si la card ya está resuelta, ignorar el drop
          if (resolvedByCard[droppedCardId]) {
            setGameState((prev) => ({
              ...prev,
              draggingNameId: null,
            }));
            setActiveCardId(null);
            dragStateRef.current = null;
            setDragState(null);
            target.releasePointerCapture(upEvent.pointerId);
            document.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("pointerup", handlePointerUp);
            return;
          }

          // Obtener el chip que se está conectando
          const chip = gameState.chips.find((c) => c.id === nameId);
          const chipName = chip?.name;

          // Evaluar si el match es correcto comparando contra el mapping
          const isCorrect = chipName ? CORRECT_MAPPING[chipName] === droppedCardId : false;

          // Actualizar estado de conexiones
          setGameState((prev) => {
            const existingIndex = prev.connections.findIndex(
              (c) => c.nameId === nameId
            );
            const newConnections = [...prev.connections];
            if (existingIndex >= 0) {
              newConnections[existingIndex] = { nameId, cardId: droppedCardId };
            } else {
              newConnections.push({ nameId, cardId: droppedCardId });
            }

            return {
              ...prev,
              connections: newConnections,
              draggingNameId: null,
            };
          });

          if (isCorrect) {
            // MATCH CORRECTO: persistir resolución y mostrar feedback temporal
            if (chipName) {
              // 1) Marcar card como resuelta con el nombre del chip
              setResolvedByCard((prev) => ({
                ...prev,
                [droppedCardId]: chipName,
              }));

              // 2) Remover chip de la lista disponible
              setGameState((prev) => ({
                ...prev,
                chips: prev.chips.filter((c) => c.id !== nameId),
              }));

              // 3) Mostrar feedback verde temporal (5s)
              setCardFeedback((prev) => ({
                ...prev,
                [droppedCardId]: "correct",
              }));

              // 4) Programar timeout para remover solo el feedback visual (mantener resolución)
              const existingTimer = correctFeedbackTimersRef.current[droppedCardId];
              if (existingTimer) {
                clearTimeout(existingTimer);
              }

              const timer = setTimeout(() => {
                setCardFeedback((prev) => ({
                  ...prev,
                  [droppedCardId]: "idle",
                }));
                correctFeedbackTimersRef.current[droppedCardId] = null;
              }, CORRECT_FEEDBACK_DELAY);

              correctFeedbackTimersRef.current[droppedCardId] = timer;
            }
          } else {
            // MATCH INCORRECTO: feedback temporal rojo
            setCardStatus((prev) => ({
              ...prev,
              [droppedCardId]: "incorrect",
            }));

            setCardFeedback((prev) => ({
              ...prev,
              [droppedCardId]: "incorrect",
            }));

            // Cancelar timer existente para esta card si existe
            const existingTimer = resetTimersRef.current[droppedCardId];
            if (existingTimer) {
              clearTimeout(existingTimer);
            }

            // Crear nuevo timer para resetear a idle después de 5s
            const timer = setTimeout(() => {
              setCardStatus((prev) => ({
                ...prev,
                [droppedCardId]: "idle",
              }));
              setCardFeedback((prev) => ({
                ...prev,
                [droppedCardId]: "idle",
              }));
              resetTimersRef.current[droppedCardId] = null;
            }, INCORRECT_RESET_DELAY);

            resetTimersRef.current[droppedCardId] = timer;
          }

          // Si había otra card conectada previamente a este chip, resetear su status
          const previousConnection = gameState.connections.find((c) => c.nameId === nameId);
          if (previousConnection && previousConnection.cardId !== droppedCardId) {
            // Cancelar timers de la card anterior si existen
            const previousTimer = resetTimersRef.current[previousConnection.cardId];
            if (previousTimer) {
              clearTimeout(previousTimer);
              resetTimersRef.current[previousConnection.cardId] = null;
            }

            const previousCorrectTimer = correctFeedbackTimersRef.current[previousConnection.cardId];
            if (previousCorrectTimer) {
              clearTimeout(previousCorrectTimer);
              correctFeedbackTimersRef.current[previousConnection.cardId] = null;
            }

            // Solo resetear si no está resuelta
            if (!resolvedByCard[previousConnection.cardId]) {
              setCardStatus((prev) => ({
                ...prev,
                [previousConnection.cardId]: "idle",
              }));
              setCardFeedback((prev) => ({
                ...prev,
                [previousConnection.cardId]: "idle",
              }));
            }
          }
        } else {
          setGameState((prev) => ({
            ...prev,
            draggingNameId: null,
          }));
        }

        setActiveCardId(null);
        dragStateRef.current = null;
        setDragState(null);
        target.releasePointerCapture(upEvent.pointerId);

        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [resolvedByCard, gameState]
  );

  // Cleanup: limpiar todos los timeouts pendientes al desmontar
  useEffect(() => {
    return () => {
      Object.values(resetTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
      Object.values(correctFeedbackTimersRef.current).forEach((timer) => {
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);

  const handleCardDrop = useCallback((cardId: string) => {
    // Mantenido por compatibilidad
  }, []);

  const handleRevealAnswers = () => {
    setMode("reveal");
  };

  const handleRestart = () => {
    // Resetear todos los estados del juego
    setResolvedByCard({});
    setCardFeedback({});
    setCardStatus({});
    setActiveCardId(null);
    setDragState(null);
    dragStateRef.current = null;
    
    // Limpiar todos los timers
    Object.values(resetTimersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    Object.values(correctFeedbackTimersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    resetTimersRef.current = {};
    correctFeedbackTimersRef.current = {};

    // Restaurar chips disponibles
    setGameState((prev) => ({
      ...prev,
      chips: mockChips,
      connections: [],
      draggingNameId: null,
      hoveredNameId: null,
    }));

    // Volver a modo play
    setMode("play");
  };

  const handleCloseGame = () => {
    // Volver a modo play sin resetear
    setMode("play");
  };

  if (gameState.showSuccess) {
    return (
      <SuccessScreen
        connections={gameState.connections}
        cards={gameState.cards}
        chips={gameState.chips}
      />
    );
  }

  // Juego completo cuando ya no quedan chips disponibles (todas las uniones correctas)
  const isGameComplete = gameState.chips.length === 0;

  useEffect(() => {
    console.log("mode", mode);
  }, [mode]);

  // En reveal mode, crear resolvedByCard automático usando CORRECT_MAPPING
  const revealResolvedByCard = mode === "reveal" 
    ? Object.entries(CORRECT_MAPPING).reduce((acc, [chipName, cardId]) => {
        acc[cardId] = chipName;
        return acc;
      }, {} as Record<string, string>)
    : resolvedByCard;

  // Cerrar pausa con tecla Escape
  useEffect(() => {
    if (!isPaused) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPaused(false);
        setGameState((prev) => ({
          ...prev,
          isPaused: false,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPaused]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {!skipBackground && <Background />}

      {/* Contenedor del juego: se bloquea mientras está en pausa o en reveal mode */}
      <div style={isPaused || mode === "reveal" ? { pointerEvents: "none" } : undefined}>
        <div className="relative z-10 min-h-screen">
          <TopHUD
            lives={gameState.lives}
            round={gameState.round}
            isMuted={gameState.isMuted}
            mode={mode}
            onPauseClick={handleTogglePause}
            onMuteToggle={handleMuteToggle}
          />

          <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
            {mode === "reveal" ? (
              <p
                style={{
                  fontFamily: "var(--font-bitter), serif",
                  fontWeight: 700,
                  fontSize: "32px",
                  color: "#FFFFFF",
                  textAlign: "center",
                }}
              >
                Right Answers are ...
              </p>
            ) : (
              <GameInstruction />
            )}
            <div ref={canvasRef} style={{ marginTop: "58px" }}>
              <CardStage
                cards={gameState.cards}
                highlightedCardId={mode === "reveal" ? null : activeCardId}
                cardStatus={cardStatus}
                resolvedByCard={revealResolvedByCard}
                cardFeedback={cardFeedback}
                onCardHover={() => {}}
                onCardDrop={handleCardDrop}
                connectSlotRef={registerConnectSlot}
              />
            </div>

            {/* Ocultar ChipRow en reveal mode */}
            {mode !== "reveal" && (
              <div style={{ marginTop: "78px" }}>
                <ChipRow
                  chips={gameState.chips}
                  hoveredNameId={gameState.hoveredNameId}
                  draggingNameId={gameState.draggingNameId}
                  onChipHover={handleChipHover}
                  onArrowPointerDown={handleArrowPointerDown}
                  chipRef={registerChipRef}
                />
              </div>
            )}
          </main>
        </div>

        {/* Botones del bottom según el modo */}
        {mode === "reveal" ? (
          /* En reveal mode: Close game (izq) + Restart (der) - fuera del bloqueo de pointer-events */
          <div
            className="absolute left-1/2 flex items-center gap-4"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
              zIndex: 20,
            }}
          >
            {/* Botón secundario: Close game (izquierda) */}
            <button
              type="button"
              onClick={handleCloseGame}
              className="rounded-[32px]"
              style={{
                width: "320px",
                height: "68px",
                fontFamily: "var(--font-bitter), serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#FFFFFF",
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "12px 32px",
                borderTop: "2px solid rgba(255, 255, 255, 0.20)",
                borderRight: "2px solid rgba(255, 255, 255, 0.20)",
                borderLeft: "2px solid rgba(255, 255, 255, 0.20)",
                borderBottom: "none",
                background:
                  "linear-gradient(0deg, rgba(255, 255, 255, 0.00) 24.06%, rgba(255, 255, 255, 0.10) 100%)",
                backgroundBlendMode: "screen",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              Close game
            </button>

            {/* Botón primario: Restart (derecha) */}
            <GamePrimaryButton onClick={handleRestart}>
              Restart
            </GamePrimaryButton>
          </div>
        ) : (
          /* En play mode: Reveal / Continue */
          <div
            className="absolute left-1/2"
            style={{
              bottom: 0,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
              zIndex: 20,
            }}
          >
            {!isGameComplete && (
              <RevealAnswersButton onClick={handleRevealAnswers} />
            )}
            {isGameComplete && (
              <GamePrimaryButton onClick={() => console.log("continue")}>
                Continue
              </GamePrimaryButton>
            )}
          </div>
        )}

        {/* Overlay de flecha durante drag (solo en play mode) */}
        {mode === "play" && dragState && (
          <DragArrowOverlay
            originX={dragState.originX}
            originY={dragState.originY}
            tipX={dragState.pointerX}
            tipY={dragState.pointerY}
          />
        )}
      </div>

      {/* Menú de pausa (overlay con blur + modal) */}
      {isPaused && (
        <PauseMenu onResume={handleTogglePause} onQuit={() => {}} />
      )}
    </div>
  );
}
