export type LabelColor = "blue" | "green" | "amber" | "rose" | "teal";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: LabelColor[];
  subtasks: Subtask[];
  startDate?: number;
  endDate?: number;
  createdAt: number;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}

export type BoardListItem = {
  id: string;
  name: string;
};

export interface KanbanState {
  boards: BoardListItem[];
  activeBoardId: string | null;
  activeBoard: Board | null;
}

// Action types
export type KanbanAction =
  | { type: "SET_STATE"; payload: KanbanState }
  | { type: "ADD_BOARD"; payload: { id: string; name: string } }
  | { type: "UPDATE_BOARD"; payload: { id: string; name: string } }
  | { type: "DELETE_BOARD"; payload: { id: string } }
  | { type: "SET_ACTIVE_BOARD"; payload: { id: string; board: Board } }
  | { type: "ADD_COLUMN"; payload: { column: Column } }
  | { type: "UPDATE_COLUMN"; payload: { columnId: string; title: string } }
  | { type: "DELETE_COLUMN"; payload: { columnId: string } }
  | { type: "ADD_CARD"; payload: { columnId: string; card: Card } }
  | { type: "UPDATE_CARD"; payload: { columnId: string; cardId: string; updates: Partial<Card> } }
  | { type: "DELETE_CARD"; payload: { columnId: string; cardId: string } }
  | { type: "MOVE_CARD"; payload: { cardId: string; sourceColumnId: string; targetColumnId: string; position: number } };

export interface IAPIResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
