import { Board, KanbanAction, KanbanState } from "./types";

export const initialState: KanbanState = {
  boards: [],
  activeBoardId: null,
  activeBoard: null,
  key: null,
  error: null,
  loading: false
};

function updateActiveBoard(
  state: KanbanState,
  updater: (board: Board) => Board,
): KanbanState {
  if (!state.activeBoard) return state;
  return { ...state, activeBoard: updater(state.activeBoard) };
}

export function kanbanReducer(
  state: KanbanState,
  action: KanbanAction,
): KanbanState {
  switch (action.type) {
    case "SET_STATE":
      return {
        ...action.payload,
      };

    case "ADD_BOARD":
      return {
        ...state,
        boards: [
          ...state.boards,
          { id: action.payload.id, name: action.payload.name },
        ],
      };

    case "UPDATE_BOARD": {
      const updated = {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.payload.id ? { ...b, name: action.payload.name } : b,
        ),
      };
      if (state.activeBoard?.id === action.payload.id) {
        updated.activeBoard = {
          ...state.activeBoard,
          name: action.payload.name,
        };
      }
      return updated;
    }

    case "DELETE_BOARD": {
      const filtered = state.boards.filter((b) => b.id !== action.payload.id);
      const wasActive = state.activeBoardId === action.payload.id;
      return {
        ...state,
        boards: filtered,
        activeBoardId: wasActive ? null : state.activeBoardId,
        activeBoard: wasActive ? null : state.activeBoard,
      };
    }

    case "SET_ACTIVE_BOARD":
      return {
        ...state,
        activeBoardId: action.payload.id,
        activeBoard: action.payload.board,
      };

    case "SET_KEY":
      return {
        ...state,
        key: action.payload.key,
      };

    case "ADD_COLUMN":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: [...b.columns, action.payload.column],
      }));

    case "UPDATE_COLUMN":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === action.payload.columnId
            ? { ...c, title: action.payload.title }
            : c,
        ),
      }));

    case "DELETE_COLUMN":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: b.columns.filter((c) => c.id !== action.payload.columnId),
      }));

    case "ADD_CARD":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === action.payload.columnId
            ? { ...c, cards: [...c.cards, action.payload.card] }
            : c,
        ),
      }));

    case "UPDATE_CARD":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === action.payload.columnId
            ? {
                ...c,
                cards: c.cards.map((card) =>
                  card.id === action.payload.cardId
                    ? { ...card, ...action.payload.updates }
                    : card,
                ),
              }
            : c,
        ),
      }));

    case "DELETE_CARD":
      return updateActiveBoard(state, (b) => ({
        ...b,
        columns: b.columns.map((c) =>
          c.id === action.payload.columnId
            ? {
                ...c,
                cards: c.cards.filter(
                  (card) => card.id !== action.payload.cardId,
                ),
              }
            : c,
        ),
      }));

    case "MOVE_CARD": {
      const { cardId, sourceColumnId, targetColumnId, position } =
        action.payload;
      return updateActiveBoard(state, (b) => {
        let movedCard: (typeof b.columns)[0]["cards"][0] | undefined;
        const columnsWithoutCard = b.columns.map((c) => {
          if (c.id === sourceColumnId) {
            const card = c.cards.find((cd) => cd.id === cardId);
            if (card) movedCard = card;
            return { ...c, cards: c.cards.filter((cd) => cd.id !== cardId) };
          }
          return c;
        });
        if (!movedCard) return b;
        const finalColumns = columnsWithoutCard.map((c) => {
          if (c.id === targetColumnId) {
            const newCards = [...c.cards];
            newCards.splice(position, 0, movedCard!);
            return { ...c, cards: newCards };
          }
          return c;
        });
        return { ...b, columns: finalColumns };
      });
    }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload.error,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload.loading,
      };

    default:
      return state;
  }
}
