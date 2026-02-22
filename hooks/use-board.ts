"use client";
import type { Board, Card, Column, LabelColor } from "@/lib/types";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export interface AppState {
  boards: Board[];
  activeBoardId: string;
}

const defaultBoardId = "board-default";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function loadState(): Promise<AppState> {
  if (typeof window === "undefined") return initialState;
  try {
    const res = await fetch(
      `${BACKEND_URL}/.netlify/functions/server/api/boards/list`,
    );
    if (!res.ok) {
      alert("Error al cargar los datos. Por favor, intenta de nuevo.");
      return initialState;
    }

    const data = await res.json();

    const boardsArr = data[0].boards;
    return {
      boards: boardsArr,
      activeBoardId: boardsArr[0]?.id ?? defaultBoardId,
    };
  } catch {
    alert("Error al cargar los datos. Por favor, intenta de nuevo.");
    return initialState;
  }
}

const initialState: AppState = {
  boards: [],
  activeBoardId: defaultBoardId,
};

let state: AppState = initialState;
let listeners: Set<() => void> = new Set();

async function emitChange() {
  try {
    const res = await fetch(
      `${BACKEND_URL}/.netlify/functions/server/api/boards/save`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boards: state.boards }),
      },
    );
    if (!res.ok)
      throw new Error("Error al guardar los boards en la base de datos");
    listeners.forEach((l) => l());
  } catch (error) {
    console.error("Error al guardar los boards en la base de datos", error);
    alert("Error al guardar los cambios. Por favor, intenta de nuevo.");
    // No se notifica a los listeners ni se guarda el estado local
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppState {
  return state;
}

function getServerSnapshot(): AppState {
  return initialState;
}

export function useBoard() {
  const [loading, setLoading] = useState(true);

  const currentState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    loadState().then((loaded) => {
      state = loaded;
      listeners.forEach((l) => l());
      setLoading(false);
    });
  }, []);

  const activeBoard =
    currentState.boards.find((b) => b.id === currentState.activeBoardId) ??
    currentState.boards[0];

  // Board management
  const addBoard = useCallback((name: string) => {
    const id = crypto.randomUUID();
    const newBoard: Board = { id, name, columns: [] };
    state = {
      ...state,
      boards: [...state.boards, newBoard],
      activeBoardId: id,
    };
    emitChange();
  }, []);

  const deleteBoard = useCallback((boardId: string) => {
    const filtered = state.boards.filter((b) => b.id !== boardId);
    if (filtered.length === 0) return;
    state = {
      ...state,
      boards: filtered,
      activeBoardId:
        state.activeBoardId === boardId ? filtered[0].id : state.activeBoardId,
    };
    emitChange();
  }, []);

  const renameBoard = useCallback((boardId: string, name: string) => {
    state = {
      ...state,
      boards: state.boards.map((b) => (b.id === boardId ? { ...b, name } : b)),
    };
    emitChange();
  }, []);

  const setActiveBoard = useCallback((boardId: string) => {
    state = { ...state, activeBoardId: boardId };

    listeners.forEach((l) => l());
    // emitChange();
  }, []);

  // Column operations (work on active board)
  function updateActiveBoard(updater: (board: Board) => Board) {
    state = {
      ...state,
      boards: state.boards.map((b) =>
        b.id === state.activeBoardId ? updater(b) : b,
      ),
    };
    emitChange();
  }

  const addCard = useCallback(
    (
      columnId: string,
      title: string,
      description?: string,
      labels?: LabelColor[],
    ) => {
      const newCard: Card = {
        id: crypto.randomUUID(),
        title,
        description,
        labels: labels ?? [],
        subtasks: [],
        createdAt: Date.now(),
      };
      updateActiveBoard((board) => ({
        ...board,
        columns: board.columns.map((col) =>
          col.id === columnId
            ? { ...col, cards: [...col.cards, newCard] }
            : col,
        ),
      }));
    },
    [],
  );

  const deleteCard = useCallback((columnId: string, cardId: string) => {
    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col,
      ),
    }));
  }, []);

  const updateCard = useCallback(
    (
      columnId: string,
      cardId: string,
      updates: Partial<Omit<Card, "id" | "createdAt">>,
    ) => {
      updateActiveBoard((board) => ({
        ...board,
        columns: board.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: col.cards.map((c) =>
                  c.id === cardId ? { ...c, ...updates } : c,
                ),
              }
            : col,
        ),
      }));
    },
    [],
  );

  const moveCard = useCallback(
    (
      fromColumnId: string,
      toColumnId: string,
      cardId: string,
      toIndex: number,
    ) => {
      updateActiveBoard((board) => {
        const fromCol = board.columns.find((c) => c.id === fromColumnId);
        if (!fromCol) return board;
        const card = fromCol.cards.find((c) => c.id === cardId);
        if (!card) return board;

        return {
          ...board,
          columns: board.columns.map((col) => {
            if (col.id === fromColumnId && col.id === toColumnId) {
              const without = col.cards.filter((c) => c.id !== cardId);
              const clamped = Math.min(toIndex, without.length);
              without.splice(clamped, 0, card);
              return { ...col, cards: without };
            }
            if (col.id === fromColumnId) {
              return {
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
              };
            }
            if (col.id === toColumnId) {
              const cards = [...col.cards];
              const clamped = Math.min(toIndex, cards.length);
              cards.splice(clamped, 0, card);
              return { ...col, cards };
            }
            return col;
          }),
        };
      });
    },
    [],
  );

  const addColumn = useCallback((title: string) => {
    const newCol: Column = { id: crypto.randomUUID(), title, cards: [] };
    updateActiveBoard((board) => ({
      ...board,
      columns: [...board.columns, newCol],
    }));
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.filter((c) => c.id !== columnId),
    }));
  }, []);

  const renameColumn = useCallback((columnId: string, title: string) => {
    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.map((c) =>
        c.id === columnId ? { ...c, title } : c,
      ),
    }));
  }, []);

  return {
    boards: currentState.boards,
    activeBoard,
    activeBoardId: currentState.activeBoardId,
    addBoard,
    deleteBoard,
    renameBoard,
    setActiveBoard,
    addCard,
    deleteCard,
    updateCard,
    moveCard,
    addColumn,
    deleteColumn,
    renameColumn,
  };
}
