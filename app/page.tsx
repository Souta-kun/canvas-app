"use client";

import { BoardSidebar } from "@/components/board-sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { useBoard } from "@/hooks/use-board";
import { useEffect, useState } from "react";

const AUTH_PIN_HASH_256 =
  "b4746d5e8a4c2ccd1f3f2c594fa0c10c254d7486f655b81f71967b89a0aa5a2a";

const hashPin = async (pin: string) => {
  if (typeof window === "undefined" || !window.crypto?.subtle) return "";
  const encoded = new TextEncoder().encode(pin);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(false); // cada carga obliga a reingresar pin
  }, []);

  const handlePinSubmit = async () => {
    const enteredHash = await hashPin(enteredPin);
    if (enteredHash && enteredHash === AUTH_PIN_HASH_256) {
      setIsAuthenticated(true);
      setPinError(null);
      setEnteredPin("");
    } else {
      setPinError("PIN incorrecto. Intenta de nuevo.");
      setIsAuthenticated(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/90 p-4 z-50">
        <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg border border-border">
          <h2 className="mb-3 text-lg font-bold">Acceso protegido</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Ingresa el PIN para continuar.
          </p>
          <input
            type="password"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handlePinSubmit();
              }
            }}
            className="w-full border border-border rounded px-3 py-2 mb-2 bg-background text-foreground"
            placeholder="PIN"
            autoFocus
          />
          {pinError && (
            <p className="text-xs text-destructive mb-2">{pinError}</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="w-full rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            type="button"
          >
            Validar PIN
          </button>
        </div>
      </div>
    );
  }

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
