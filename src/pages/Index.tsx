import { BoardSidebar } from "@/kanban/components/BoardSidebar";
import { BoardView } from "@/kanban/components/BoardView";
import { KeyGate } from "@/kanban/components/KeyGate";
import { useKanban } from "@/kanban/context";
import { useBoardService } from "@/kanban/services/board.service";
import { useEffect, useState } from "react";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { state, dispatch } = useKanban();
  const boardService = useBoardService();

  useEffect(() => {
    if (state.key === null) return;

    const loadData = async () => {
      const boards = await boardService.loadBoardList();

      if (boards === null) {
        return;
      }

      dispatch({
        type: "SET_STATE",
        payload: {
          boards,
          activeBoardId: null,
          activeBoard: null,
          key: state.key,
          error: null,
          loading: false
        },
      });

      if (boards && boards.length > 0) {
        const board = await boardService.loadBoard(boards[0].id);
        if (board) {
          dispatch({
            type: "SET_ACTIVE_BOARD",
            payload: { id: boards[0].id, board },
          });
        }
      }
    };

    loadData();
  }, [state.key]);

  return (
    <KeyGate>
      <div className="flex h-screen overflow-hidden">
        <BoardSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
        <BoardView />
      </div>
    </KeyGate>
  );
};

export default Index;
