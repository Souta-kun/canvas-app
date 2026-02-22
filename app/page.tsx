"use client";

import { BoardSidebar } from "@/components/board-sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { useBoard } from "@/hooks/use-board";
import { useState } from "react";

export default function Page() {
  const {
    boards,
    activeBoard,
    activeBoardId,
    addBoard,
    deleteBoard,
    renameBoard,
    setActiveBoard,
  } = useBoard();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <BoardSidebar
        boards={boards}
        activeBoardId={activeBoardId}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        onSelect={setActiveBoard}
        onAdd={addBoard}
        onRename={renameBoard}
        onDelete={deleteBoard}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          {activeBoard ? (
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">
                {activeBoard.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeBoard.columns.length} listas &middot;{" "}
                {activeBoard.columns.reduce((a, c) => a + c.cards.length, 0)}{" "}
                tarjetas
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">
                No hay un tablero activo
              </h1>
            </div>
          )}
          {/* Export Button */}
          <button
            className="ml-4 px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium border border-primary/30 shadow"
            onClick={() => {
              if (typeof window === "undefined") return;
              const data = localStorage.getItem("kanban-app-state");
              if (!data) return;
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "kanban-app-state.json";
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 0);
            }}
            type="button"
            title="Exportar datos"
          >
            Exportar JSON
          </button>
        </header>

        {/* Board */}
        <main className="flex-1 overflow-x-auto overflow-y-auto px-6 pt-6 h-full min-h-0">
          {activeBoard && <KanbanBoard />}
        </main>
      </div>
    </div>
  );
}
