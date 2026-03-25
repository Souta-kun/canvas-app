import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { useKanban } from "../context";
import { useCardService } from "../services/card.service";
import { useColumnService } from "../services/column.service";
import { Card, Column } from "../types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: Column;
  boardId: string;
  onCardClick: (card: Card, columnId: string) => void;
}

export function KanbanColumn({
  column,
  boardId,
  onCardClick,
}: KanbanColumnProps) {
  const { dispatch } = useKanban();
  const cardService = useCardService();
  const columnService = useColumnService();
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [dragOver, setDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleAddCard = async () => {
    const title = newCardTitle.trim();
    if (!title) return;

    const card = await cardService.addCard(
      boardId,
      column.id,
      title,
      Date.now(),
    );

    if (card) {
      dispatch({
        type: "ADD_CARD",
        payload: { columnId: column.id, card },
      });
      setNewCardTitle("");
      setAddingCard(false);
    }
  };

  const getDropPosition = (e: React.DragEvent): number => {
    const container = cardsRef.current;
    if (!container) return column.cards.length;
    const cards = Array.from(container.querySelectorAll("[data-card-id]"));
    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) return i;
    }
    return column.cards.length;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
    setDropIndex(getDropPosition(e));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setDropIndex(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const position = getDropPosition(e);
      // Same column, same position — no-op
      if (data.columnId === column.id) {
        const currentIndex = column.cards.findIndex(
          (c) => c.id === data.cardId,
        );
        if (currentIndex === position || currentIndex === position - 1) return;
      }

      const response = await cardService.moveCard(
        boardId,
        data.cardId,
        data.columnId,
        column.id,
        position,
      );

      if (!response) return;

      dispatch({
        type: "MOVE_CARD",
        payload: {
          cardId: data.cardId,
          sourceColumnId: data.columnId,
          targetColumnId: column.id,
          position,
        },
      });
    } catch {}
  };

  const confirmEdit = async () => {
    if (editTitle.trim()) {
      const response = await columnService.updateColumn(
        column.id,
        boardId,
        editTitle.trim(),
      );

      if (response) {
        dispatch({
          type: "UPDATE_COLUMN",
          payload: { columnId: column.id, title: editTitle.trim() },
        });
      }
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "w-72 shrink-0 flex flex-col rounded-xl bg-[hsl(var(--kanban-column))] max-h-full",
        dragOver && "ring-2 ring-primary/40",
      )}
      onDragOver={handleDragOver}
      onDragLeave={() => {
        setDragOver(false);
        setDropIndex(null);
      }}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {editing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-xs"
              onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
              autoFocus
            />
            <button onClick={confirmEdit} className="text-primary">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {column.title}
              </h3>
              <span className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 tabular-nums">
                {column.cards.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-muted text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(true);
                    setEditTitle(column.title);
                  }}
                >
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    const response = await columnService.removeColumn(
                      column.id,
                      boardId,
                    );

                    if (response) {
                      dispatch({
                        type: "DELETE_COLUMN",
                        payload: { columnId: column.id },
                      });
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      {/* Cards */}
      <div
        ref={cardsRef}
        className="flex-1 overflow-y-auto kanban-scrollbar px-2 pb-2 space-y-2"
      >
        {column.cards.map((card, index) => (
          <React.Fragment key={card.id}>
            {dropIndex === index && (
              <div className="h-1 rounded-full bg-primary/50 mx-1 transition-all" />
            )}
            <KanbanCard
              card={card}
              onClick={() => onCardClick(card, column.id)}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ cardId: card.id, columnId: column.id }),
                );
                e.dataTransfer.effectAllowed = "move";
              }}
            />
          </React.Fragment>
        ))}
        {dropIndex === column.cards.length && (
          <div className="h-1 rounded-full bg-primary/50 mx-1 transition-all" />
        )}
      </div>

      {/* Add card */}
      <div className="p-2 pt-0">
        {addingCard ? (
          <div className="space-y-1.5">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Título de la tarjeta"
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAddCard()}
              autoFocus
            />
            <div className="flex gap-1.5">
              <Button size="sm" onClick={handleAddCard} className="h-7 text-xs">
                Agregar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAddingCard(false);
                  setNewCardTitle("");
                }}
                className="h-7 text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground text-xs h-8"
            onClick={() => setAddingCard(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar tarjeta
          </Button>
        )}
      </div>
    </div>
  );
}
