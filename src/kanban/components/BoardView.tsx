import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Columns3, Plus, X } from "lucide-react";
import { useState } from "react";
import { useKanban } from "../context";
import { useColumnService } from "../services/column.service";
import { Card as CardType } from "../types";
import { CardModal } from "./CardModal";
import { KanbanColumn } from "./KanbanColumn";

export function BoardView() {
  const { state, dispatch } = useKanban();
  const columnService = useColumnService();
  const board = state.activeBoard;
  const [addingCol, setAddingCol] = useState(false);
  const [colTitle, setColTitle] = useState("");
  const [modalCard, setModalCard] = useState<CardType | null>(null);
  const [modalColumnId, setModalColumnId] = useState<string | null>(null);

  const handleAddColumn = async () => {
    const title = colTitle.trim();
    if (!title || !board) return;

    const newColumn = await columnService.addColumn(board.id, title);
    if (!newColumn) return;

    dispatch({
      type: "ADD_COLUMN",
      payload: {
        column: {
          id: newColumn.id,
          title: newColumn.title,
          cards: newColumn.cards,
        },
      },
    });
    setColTitle("");
    setAddingCol(false);
  };

  const openCard = (card: CardType, columnId: string) => {
    setModalCard(card);
    setModalColumnId(columnId);
  };

  // Re-read card from state for modal (live updates)
  const liveCard =
    board?.columns
      .find((c) => c.id === modalColumnId)
      ?.cards.find((c) => c.id === modalCard?.id) ?? null;

  if (!board) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Columns3 className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            Selecciona o crea un tablero para empezar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Board header */}
      <header className="h-14 flex items-center px-6 border-b bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {board.name}
        </h1>
        <span className="ml-3 text-xs text-muted-foreground">
          {board.columns.length} columnas
        </span>
      </header>

      {/* Columns area */}
      <div className="flex-1 overflow-x-auto kanban-scrollbar p-6">
        <div className="flex gap-4 h-full items-start">
          {board.columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              boardId={board.id}
              onCardClick={openCard}
            />
          ))}

          {/* Add column */}
          {addingCol ? (
            <div className="w-72 shrink-0 bg-[hsl(var(--kanban-column))] rounded-xl p-3 space-y-2">
              <Input
                value={colTitle}
                onChange={(e) => setColTitle(e.target.value)}
                placeholder="Nombre de la columna"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                autoFocus
              />
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  onClick={handleAddColumn}
                  className="h-7 text-xs"
                >
                  Agregar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingCol(false);
                    setColTitle("");
                  }}
                  className="h-7 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCol(true)}
              className="w-72 shrink-0 h-10 rounded-xl border-2 border-dashed border-border hover:border-primary/40 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar columna
            </button>
          )}
        </div>
      </div>

      {/* Card modal */}
      <CardModal
        card={liveCard}
        columnId={modalColumnId}
        boardId={board.id}
        open={!!liveCard}
        onClose={() => {
          setModalCard(null);
          setModalColumnId(null);
        }}
      />
    </div>
  );
}
