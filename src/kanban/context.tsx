import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { initialState, kanbanReducer } from "./reducer";
import { useBoardService } from "./services/board.service";
import { KanbanAction, KanbanState } from "./types";

interface KanbanContextValue {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  selectBoard: (id: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  const boardService = useBoardService(state.key);

  useEffect(() => {
    if (state.key === null) return;

    const loadData = async () => {
      const boards = await boardService.loadBoardList();

      dispatch({
        type: "SET_STATE",
        payload: { boards, activeBoardId: null, activeBoard: null, key: state.key },
      });

      if (boards && boards.length > 0) {
        selectBoard(boards[0].id);
      }
    };

    loadData();
  }, [boardService, state.key]);

  const selectBoard = useCallback(
    async (id: string) => {
      const board = await boardService.loadBoard(id);
      if (board) {
        dispatch({ type: "SET_ACTIVE_BOARD", payload: { id, board } });
      }
    },
    [boardService],
  );

  return (
    <KanbanContext.Provider value={{ state, dispatch, selectBoard }}>
      {children}
    </KanbanContext.Provider>
  );
}

export function useKanban() {
  const ctx = useContext(KanbanContext);
  if (!ctx) throw new Error("useKanban must be used within KanbanProvider");
  return ctx;
}
