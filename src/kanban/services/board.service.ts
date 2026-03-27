import useHttp from "@/lib/useHttp";
import { useCallback, useMemo } from "react";
import { useKanban } from "../context";
import { Board, BoardListItem, IAPIResult } from "../types";

export const useBoardService = () => {
  const { state, dispatch } = useKanban();
  const { http } = useHttp(state.key);

  const loadBoardList = async (): Promise<BoardListItem[] | null> => {
    dispatch({ type: "SET_LOADING", payload: { loading: true } });
    try {
      const response = await http.get<IAPIResult<BoardListItem[]>>(`/boards`);

      const { data } = response.data;

      return data || [];
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: {
          error:
            error.response?.data?.error ||
            "Failed to load board list. Please try again.",
        },
      });
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: { loading: false } });
    }
  };

  const loadBoard = useCallback(
    async (id: string): Promise<Board | null> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
      try {
        const response = await http.get<IAPIResult<Board>>(`/boards/${id}`);

        const { data } = response.data;

        return data || null;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to load board. Please try again.",
          },
        });
        return null;
      } finally {
        dispatch({ type: "SET_LOADING", payload: { loading: false } });
      }
    },
    [http],
  );

  const addBoard = async (name: string): Promise<Board | null> => {
    dispatch({ type: "SET_LOADING", payload: { loading: true } });
    try {
      const response = await http.post<IAPIResult<Board>>(`/boards`, {
        name,
      });

      const { data } = response.data;

      return data || null;
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: {
          error:
            error.response?.data?.error ||
            "Failed to add board. Please try again.",
        },
      });
      return null;
    } finally {
      dispatch({ type: "SET_LOADING", payload: { loading: false } });
    }
  };

  const updateBoard = useCallback(
    async (id: string, name: string): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
      try {
        await http.put<IAPIResult<Board>>(`/boards`, { id, name });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to update board. Please try again.",
          },
        });
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: { loading: false } });
      }
    },
    [http],
  );

  const removeBoard = useCallback(
    async (id: string): Promise<boolean> => {
      dispatch({ type: "SET_LOADING", payload: { loading: true } });
      try {
        await http.delete<IAPIResult<Board>>(`/boards/${id}`);

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to remove board. Please try again.",
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
      loadBoardList,
      loadBoard,
      addBoard,
      updateBoard,
      removeBoard,
    }),
    [loadBoardList, loadBoard, addBoard, updateBoard, removeBoard],
  );
};
