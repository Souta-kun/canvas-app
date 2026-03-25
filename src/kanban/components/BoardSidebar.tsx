import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Check,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useKanban } from "../context";
import { useBoardService } from "../services/board.service";

interface BoardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function BoardSidebar({ collapsed, onToggle }: BoardSidebarProps) {
  const { state, dispatch, selectBoard } = useKanban();
  const boardService = useBoardService(state.key);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;

    const newBoard = await boardService.addBoard(name);

    if (newBoard) {
      dispatch({
        type: "ADD_BOARD",
        payload: { id: newBoard.id, name: newBoard.name },
      });
      setNewName("");
      setAdding(false);
      // Auto-select the new board
      setTimeout(async () => await selectBoard(newBoard.id), 0);
    }
  };

  const handleDelete = async (id: string) => {
    const removed = await boardService.removeBoard(id);

    if (removed) {
      dispatch({ type: "DELETE_BOARD", payload: { id } });
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const confirmEdit = async () => {
    if (editingId && editName.trim()) {
      const updated = await boardService.updateBoard(
        editingId,
        editName.trim(),
      );

      if (updated) {
        dispatch({
          type: "UPDATE_BOARD",
          payload: { id: editingId, name: editName.trim() },
        });
      }
    }
    setEditingId(null);
  };

  if (collapsed) {
    return (
      <aside className="w-14 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
        <div className="p-3 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-sidebar-primary" />
        </div>
        <nav className="flex-1 overflow-y-auto px-1.5 space-y-1 py-2">
          {state.boards.map((board) => (
            <button
              key={board.id}
              title={board.name}
              onClick={() => selectBoard(board.id)}
              className={cn(
                "w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold transition-colors",
                state.activeBoardId === board.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70",
              )}
            >
              {board.name.charAt(0).toUpperCase()}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={onToggle}
            className="w-9 h-9 rounded-md flex items-center justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
      <div className="p-5 flex items-center gap-2.5">
        <LayoutDashboard className="w-5 h-5 text-sidebar-primary" />
        <span className="text-base font-semibold tracking-tight flex-1">
          Kanban
        </span>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-muted px-2">
          Tableros ({state.boards.length})
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto kanban-scrollbar px-2 space-y-0.5">
        {state.boards.map((board) => (
          <div
            key={board.id}
            className={cn(
              "group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
              state.activeBoardId === board.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground/70",
            )}
            onClick={() => selectBoard(board.id)}
          >
            {editingId === board.id ? (
              <div
                className="flex items-center gap-1 flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  autoFocus
                />
                <button
                  onClick={confirmEdit}
                  className="text-sidebar-primary hover:opacity-80"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sidebar-muted hover:opacity-80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <span className="truncate flex-1">{board.name}</span>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(board.id, board.name);
                    }}
                    className="p-0.5 hover:text-sidebar-primary"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(board.id);
                    }}
                    className="p-0.5 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {adding ? (
          <div className="flex gap-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del tablero"
              className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleAdd}
              className="h-8 px-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            >
              <Check className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewName("");
              }}
              className="h-8 px-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent text-sm h-9"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo tablero
          </Button>
        )}
      </div>
    </aside>
  );
}
