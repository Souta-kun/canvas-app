"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Board } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronLeft,
  LayoutGrid,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface BoardSidebarProps {
  boards: Board[];
  activeBoardId: string;
  collapsed: boolean;
  onToggle: () => void;
  onSelect: (boardId: string) => void;
  onAdd: (name: string) => void;
  onRename: (boardId: string, name: string) => void;
  onDelete: (boardId: string) => void;
}

export function BoardSidebar({
  boards,
  activeBoardId,
  collapsed,
  onToggle,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: BoardSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewName("");
    setIsAdding(false);
  }

  function startRename(board: Board) {
    setEditingId(board.id);
    setEditName(board.name);
  }

  function handleRename() {
    const trimmed = editName.trim();
    if (trimmed && editingId) {
      onRename(editingId, trimmed);
    }
    setEditingId(null);
  }

  // Soporte para abrir modal de importación
  useEffect(() => {
    const handler = () => {
      if (
        typeof window !== "undefined" &&
        typeof (window as any).onImportJson === "function"
      ) {
        (window as any).onImportJson();
      }
    };
    window.addEventListener("open-import-json-modal", handler);
    return () => window.removeEventListener("open-import-json-modal", handler);
  }, []);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center border-r border-border bg-card py-4 px-2 gap-2 w-14 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground rotate-180"
          onClick={onToggle}
          aria-label="Expandir sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="h-px w-full bg-border my-1" />
        {boards.map((board) => (
          <button
            key={board.id}
            onClick={() => onSelect(board.id)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors",
              board.id === activeBoardId
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label={board.name}
            title={board.name}
          >
            {board.name.charAt(0).toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => {
            onToggle();
            setTimeout(() => setIsAdding(true), 200);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground transition-colors"
          aria-label="Nuevo tablero"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r border-border bg-card w-60 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Tableros
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
          aria-label="Colapsar sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Board List */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {boards.map((board) => (
            <div
              key={board.id}
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors cursor-pointer",
                board.id === activeBoardId
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={() => {
                if (editingId !== board.id) onSelect(board.id);
              }}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold shrink-0",
                  board.id === activeBoardId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {board.name.charAt(0).toUpperCase()}
              </span>

              {editingId === board.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-6 text-xs px-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={handleRename}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename();
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm truncate flex-1">{board.name}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(board);
                      }}
                      aria-label={`Renombrar "${board.name}"`}
                    >
                      <Pencil className="h-2.5 w-2.5" />
                    </Button>
                    {boards.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(board.id);
                        }}
                        aria-label={`Eliminar "${board.name}"`}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Add Board */}
      <div className="border-t border-border px-2 py-2">
        {isAdding ? (
          <div className="flex flex-col gap-2 p-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del tablero..."
              className="h-8 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewName("");
                }
              }}
            />
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                Crear
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsAdding(true)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo tablero
            </button>
          </>
        )}
      </div>
    </div>
  );
}
