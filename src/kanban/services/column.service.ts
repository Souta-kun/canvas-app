import useHttp from "@/lib/useHttp";
import { useCallback, useMemo } from "react";
import { v7 as uuidv7 } from "uuid";
import { useKanban } from "../context";
import { Column, IAPIResult } from "../types";

export const useColumnService = () => {
  const { state, dispatch } = useKanban();
  const { http } = useHttp(state.key);

  const addColumn = useCallback(
    async (boardId: string, title: string): Promise<Column | null> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
      try {
        const response = await http.post<IAPIResult<Column>>(`/columns`, {
          id: uuidv7(),
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
      } finally {
        dispatch({ type: "SET_LOADING", payload: { loading: false } });
      }
    },
    [http],
  );

  const updateColumn = useCallback(
    async (id: string, boardId: string, title: string): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
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
      } finally {
        dispatch({ type: "SET_LOADING", payload: { loading: false } });
      }
    },
    [http],
  );

  const removeColumn = useCallback(
    async (id: string, boardId: string): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
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
      } finally {
        dispatch({ type: "SET_LOADING", payload: { loading: false } });
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
