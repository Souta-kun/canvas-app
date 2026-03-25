import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { initialState, kanbanReducer } from "./reducer";
import { boardService } from "./services/board.service";
import { KanbanAction, KanbanState } from "./types";

interface KanbanContextValue {
  state: KanbanState;
  dispatch: React.Dispatch<KanbanAction>;
  selectBoard: (id: string) => Promise<void>;
}

const KanbanContext = createContext<KanbanContextValue | null>(null);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    const loadData = async () => {
      const boards = await boardService.loadBoardList();

      dispatch({
        type: "SET_STATE",
        payload: { boards, activeBoardId: null, activeBoard: null },
      });

      if (boards && boards.length > 0) {
        selectBoard(boards[0].id);
      }
      
      setLoaded(true);
    };

    loadData();
  }, []);

  const selectBoard = useCallback(async (id: string) => {
    const board = await boardService.loadBoard(id);
    if (board) {
      dispatch({ type: "SET_ACTIVE_BOARD", payload: { id, board } });
    }
  }, []);

  if (!loaded) return null;

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
