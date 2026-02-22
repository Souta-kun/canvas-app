"use client";

import { AddColumnForm } from "@/components/add-column-form";
import { BoardColumn } from "@/components/board-column";
import { CardDetailModal } from "@/components/card-detail-modal";
import { useBoard } from "@/hooks/use-board";
import type { Card } from "@/lib/types";
import { useCallback, useState } from "react";

export function KanbanBoard() {
  const {
    activeBoard,
    addCard,
    deleteCard,
    updateCard,
    moveCard,
    addColumn,
    deleteColumn,
    renameColumn,
  } = useBoard();

  const [dragState, setDragState] = useState<{
    cardId: string;
    fromColumnId: string;
  } | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<string | null>(null);

  // Modal state
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = useCallback((card: Card, columnId: string) => {
    setSelectedCard(card);
    setSelectedColumnId(columnId);
    setModalOpen(true);
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardId: string, columnId: string) => {
      e.dataTransfer.effectAllowed = "move";
      setDragState({ cardId, fromColumnId: columnId });
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetColumn(columnId);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toColumnId: string) => {
      e.preventDefault();
      if (!dragState) return;

      const toCol = activeBoard.columns.find((c) => c.id === toColumnId);
      const toIndex = toCol ? toCol.cards.length : 0;

      moveCard(dragState.fromColumnId, toColumnId, dragState.cardId, toIndex);
      setDragState(null);
      setDropTargetColumn(null);
    },
    [dragState, activeBoard.columns, moveCard],
  );

  // Keep modal card in sync with store
  const currentCard = selectedCard
    ? (activeBoard.columns
        .flatMap((col) => col.cards)
        .find((c) => c.id === selectedCard.id) ?? selectedCard)
    : null;

  const selectedColumnTitle =
    activeBoard.columns.find((c) => c.id === selectedColumnId)?.title ?? "";

  return (
    <>
      <div
        className="flex gap-4 overflow-x-auto pb-4 h-full min-h-0"
        onDragEnd={() => {
          setDragState(null);
          setDropTargetColumn(null);
        }}
      >
        {activeBoard.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            onAddCard={addCard}
            onDeleteColumn={deleteColumn}
            onRenameColumn={renameColumn}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onCardClick={handleCardClick}
            isDropTarget={
              dropTargetColumn === column.id &&
              dragState?.fromColumnId !== column.id
            }
          />
        ))}
        <AddColumnForm onAdd={addColumn} />
      </div>

      <CardDetailModal
        card={currentCard}
        columnId={selectedColumnId}
        columnTitle={selectedColumnTitle}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setSelectedCard(null);
            setSelectedColumnId(null);
          }
        }}
        onUpdate={updateCard}
        onDelete={deleteCard}
      />
    </>
  );
}
