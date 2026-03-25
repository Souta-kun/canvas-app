import useHttp from "@/lib/useHttp";
import { useCallback, useMemo } from "react";
import { useKanban } from "../context";
import { Card, IAPIResult, LabelColor, Subtask } from "../types";

export const useCardService = () => {
  const { state, dispatch } = useKanban();
  const { http } = useHttp(state.key);

  const addCard = useCallback(
    async (
      boardId: string,
      columnId: string,
      title: string,
      createdAt: number,
    ): Promise<Card | null> => {
      try {
        const response = await http.post<IAPIResult<Card>>(`/cards`, {
          boardId,
          columnId,
          title,
          createdAt,
        });

        const { data } = response.data;

        return data || null;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to add card. Please try again.",
          },
        });
        return null;
      }
    },
    [http],
  );

  const updateCard = useCallback(
    async (
      id: string,
      columnId: string,
      boardId: string,
      title: string,
      description?: string,
      labels?: LabelColor[],
      startDate?: number,
      endDate?: number,
      subtasks?: Subtask[],
    ): Promise<boolean> => {
      try {
        await http.put<IAPIResult<Card>>(`/cards`, {
          id,
          columnId,
          boardId,
          title,
          description,
          labels,
          startDate,
          endDate,
          subtasks,
        });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to update card. Please try again.",
          },
        });
        return false;
      }
    },
    [http],
  );

  const removeCard = useCallback(
    async (id: string, columnId: string, boardId: string): Promise<boolean> => {
      try {
        await http.delete<IAPIResult<Card>>(`/cards/`, {
          data: { id, columnId, boardId },
        });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to remove card. Please try again.",
          },
        });
        return false;
      }
    },
    [http],
  );

  const moveCard = useCallback(
    async (
      boardId: string,
      cardId: string,
      sourceColumnId: string,
      targetColumnId: string,
      position: number,
    ): Promise<boolean> => {
      try {
        await http.put<IAPIResult<Card>>(`/cards/move`, {
          boardId,
          cardId,
          sourceColumnId,
          targetColumnId,
          position,
        });

        return true;
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: {
            error:
              error.response?.data?.error ||
              "Failed to move card. Please try again.",
          },
        });
        return false;
      }
    },
    [http],
  );

  return useMemo(
    () => ({
      addCard,
      updateCard,
      removeCard,
      moveCard,
    }),
    [addCard, updateCard, removeCard, moveCard],
  );
};
