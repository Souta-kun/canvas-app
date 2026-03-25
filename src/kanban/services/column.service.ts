import useHttp from "@/lib/useHttp";
import { useCallback, useMemo } from "react";
import { useKanban } from "../context";
import { Column, IAPIResult } from "../types";

export const useColumnService = () => {
  const { state, dispatch } = useKanban();
  const { http } = useHttp(state.key);

  const addColumn = useCallback(
    async (boardId: string, title: string): Promise<Column | null> => {
      try {
        const response = await http.post<IAPIResult<Column>>(`/columns`, {
          boardId,
          title,
        });

        const { data } = response.data;

        return data || null;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to add column. Please try again.",
          },
        });
        return null;
      }
    },
    [http],
  );

  const updateColumn = useCallback(
    async (id: string, boardId: string, title: string): Promise<boolean> => {
      try {
        await http.put<IAPIResult<Column>>(`/columns`, {
          id,
          boardId,
          title,
        });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to update column. Please try again.",
          },
        });
        return false;
      }
    },
    [http],
  );

  const removeColumn = useCallback(
    async (id: string, boardId: string): Promise<boolean> => {
      try {
        await http.delete<IAPIResult<Column>>(`/columns/`, {
          data: { id, boardId },
        });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to remove column. Please try again.",
          },
        });
        return false;
      }
    },
    [http],
  );

  return useMemo(
    () => ({
      addColumn,
      updateColumn,
      removeColumn,
    }),
    [addColumn, updateColumn, removeColumn],
  );
};
