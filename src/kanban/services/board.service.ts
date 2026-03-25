import useHttp from "@/lib/useHttp";
import { useCallback, useMemo } from "react";
import { Board, BoardListItem, IAPIResult } from "../types";

export const useBoardService = (apiKey: number | null = null) => {
  const { http } = useHttp(apiKey);

  const loadBoardList = useCallback(async (): Promise<BoardListItem[]> => {
    try {
      const response = await http.get<IAPIResult<BoardListItem[]>>(`/boards`);

      const { data } = response.data;

      return data || [];
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to load board list. Please try again.",
      );
      return [];
    }
  }, [http]);

  const loadBoard = useCallback(
    async (id: string): Promise<Board | null> => {
      try {
        const response = await http.get<IAPIResult<Board>>(`/boards/${id}`);

        const { data } = response.data;

        return data || null;
      } catch (error) {
        alert(
          error.response?.data?.error ||
            "Failed to load board. Please try again.",
        );
        return null;
      }
    },
    [http],
  );

  const addBoard = useCallback(
    async (name: string): Promise<Board | null> => {
      try {
        const response = await http.post<IAPIResult<Board>>(`/boards`, {
          name,
        });

        const { data } = response.data;

        return data || null;
      } catch (error) {
        alert(
          error.response?.data?.error ||
            "Failed to add board. Please try again.",
        );
        return null;
      }
    },
    [http],
  );

  const updateBoard = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      try {
        await http.put<IAPIResult<Board>>(`/boards`, { id, name });

        return true;
      } catch (error) {
        alert(
          error.response?.data?.error ||
            "Failed to update board. Please try again.",
        );
        return false;
      }
    },
    [http],
  );

  const removeBoard = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await http.delete<IAPIResult<Board>>(`/boards/${id}`);

        return true;
      } catch (error) {
        alert(
          error.response?.data?.error ||
            "Failed to remove board. Please try again.",
        );
        return false;
      }
    },
    [http],
  );

  return useMemo(
    () => ({
      loadBoardList,
      loadBoard,
      addBoard,
      updateBoard,
      removeBoard,
    }),
    [loadBoardList, loadBoard, addBoard, updateBoard, removeBoard],
  );
};
