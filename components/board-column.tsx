"use client";

import { AddCardForm } from "@/components/add-card-form";
import { BoardCard } from "@/components/board-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Card, Column, LabelColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

interface BoardColumnProps {
  column: Column;
  onAddCard: (
    columnId: string,
    title: string,
    description?: string,
    labels?: LabelColor[],
  ) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, title: string) => void;
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onDragOver: (e: React.DragEvent, columnId: string) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onCardClick: (card: Card, columnId: string) => void;
  isDropTarget: boolean;
}

export function BoardColumn({
  column,
  onAddCard,
  onDeleteColumn,
  onRenameColumn,
  onDragStart,
  onDragOver,
  onDrop,
  onCardClick,
  isDropTarget,
}: BoardColumnProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  function handleRename() {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== column.title) {
      onRenameColumn(column.id, trimmed);
    }
    setIsRenaming(false);
  }

  return (
    <div
      className={cn(
        "flex h-full w-[300px] shrink-0 flex-col rounded-xl border border-border bg-muted/50 transition-colors",
        isDropTarget && "border-primary/50 bg-primary/5",
      )}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {isRenaming ? (
          <div className="flex items-center gap-1 flex-1 mr-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-7 text-sm font-semibold"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") {
                  setEditTitle(column.title);
                  setIsRenaming(false);
                }
              }}
              onBlur={handleRename}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleRename}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => {
                setEditTitle(column.title);
                setIsRenaming(false);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {column.title}
            </h3>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-medium text-muted-foreground">
              {column.cards.length}
            </span>
          </div>
        )}

        {!isRenaming && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label={`Opciones de columna "${column.title}"`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => {
                  setEditTitle(column.title);
                  setIsRenaming(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Renombrar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteColumn(column.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Add Card */}
      <div className="px-2 pb-3">
        <AddCardForm columnId={column.id} onAdd={onAddCard} />
      </div>

      {/* Cards Area */}
      <div
        className="flex-1 px-2 overflow-y-auto min-h-0"
        style={{ height: "100%", minHeight: 0 }}
      >
        <div className="flex flex-col gap-2 pb-2">
          {column.cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              columnId={column.id}
              onDragStart={onDragStart}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
