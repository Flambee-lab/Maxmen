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
  const connectSlotsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const chipRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragStateRef = useRef<DragState | null>(null);

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

        dragStateRef.current = {
          ...dragStateRef.current,
          pointerX: moveEvent.clientX,
          pointerY: moveEvent.clientY,
        };

        setDragState({
          ...dragStateRef.current,
        });
      };

      const handlePointerUp = (upEvent: PointerEvent) => {
        const dropX = upEvent.clientX;
        const dropY = upEvent.clientY;

        let droppedCardId: string | null = null;
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

        if (droppedCardId) {
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

            const chip = prev.chips.find((c) => c.id === nameId);
            const isCorrect = chip?.correctCardId === droppedCardId;

            return {
              ...prev,
              connections: newConnections,
              chips: prev.chips.map((c) =>
                c.id === nameId ? { ...c, isMatched: isCorrect } : c
              ),
              cards: prev.cards.map((c) =>
                c.id === droppedCardId ? { ...c, isMatched: isCorrect } : c
              ),
              draggingNameId: null,
              showSuccess: newConnections.every((conn) => {
                const c = prev.chips.find((ch) => ch.id === conn.nameId);
                return c?.correctCardId === conn.cardId;
              }),
            };
          });
        } else {
          setGameState((prev) => ({
            ...prev,
            draggingNameId: null,
          }));
        }

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
          <div style={{ marginTop: "58px" }}>
            <CardStage
              cards={gameState.cards}
              highlightedCardId={null}
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
