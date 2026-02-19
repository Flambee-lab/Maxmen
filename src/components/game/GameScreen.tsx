"use client";

import { useState, useCallback, useRef } from "react";
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

interface DragState {
  nameId: string;
  originX: number;
  originY: number;
  pointerX: number;
  pointerY: number;
}

interface GameScreenProps {
  /** Si true, no renderiza Background (lo provee GameContainer) */
  skipBackground?: boolean;
}

export function GameScreen({ skipBackground = false }: GameScreenProps = {}) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const connectSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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
              hoveredCardId = targetId;
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
          // Registrar selección (sin UI de feedback aún)
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

            // Por ahora solo guardamos la conexión, sin marcar correcto/incorrecto todavía
            return {
              ...prev,
              connections: newConnections,
              draggingNameId: null,
            };
          });
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
    []
  );

  const handleCardDrop = useCallback((cardId: string) => {
    // Mantenido por compatibilidad
  }, []);

  const handleRevealAnswers = () => {
    setGameState((prev) => ({
      ...prev,
      showSuccess: true,
    }));
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      {!skipBackground && <Background />}

      <div className="relative z-10 min-h-screen">
        <TopHUD
          lives={gameState.lives}
          round={gameState.round}
          isMuted={gameState.isMuted}
          onPauseClick={handleTogglePause}
          onMuteToggle={handleMuteToggle}
        />

        <main className="flex flex-col items-center w-full" style={{ marginTop: "58px" }}>
          <GameInstruction />
          <div ref={canvasRef} style={{ marginTop: "58px" }}>
            <CardStage
              cards={gameState.cards}
              highlightedCardId={activeCardId}
              onCardHover={() => {}}
              onCardDrop={handleCardDrop}
              connectSlotRef={registerConnectSlot}
            />
          </div>

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
        </main>
      </div>

      {/* Botón Reveal Answers centrado en la parte inferior del layout */}
      <div
        className="absolute left-1/2"
        style={{ bottom: 0, transform: "translateX(-50%)" }}
      >
        <RevealAnswersButton onClick={handleRevealAnswers} />
      </div>

      {/* Overlay de flecha durante drag */}
      {dragState && (
        <DragArrowOverlay
          originX={dragState.originX}
          originY={dragState.originY}
          tipX={dragState.pointerX}
          tipY={dragState.pointerY}
        />
      )}

      {/* Menú de pausa */}
      {gameState.isPaused && (
        <PauseMenu onResume={handleTogglePause} onQuit={() => {}} />
      )}
    </div>
  );
}
