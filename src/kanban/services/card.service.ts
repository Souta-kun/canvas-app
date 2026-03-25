import api from "@/lib/api";
import { Card, IAPIResult, LabelColor, Subtask } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const cardService = {
  async addCard(
    boardId: string,
    columnId: string,
    title: string,
    createdAt: number,
  ): Promise<Card | null> {
    try {
      const response = await api.post<IAPIResult<Card>>(`${API_URL}/cards`, {
        boardId,
        columnId,
        title,
        createdAt,
      });

      const { data } = response.data;

      return data || null;
    } catch (error) {
      alert(
        error.response?.data?.error || "Failed to add card. Please try again.",
      );
      return null;
    }
  },

  async updateCard(
    id: string,
    columnId: string,
    boardId: string,
    title: string,
    description?: string,
    labels?: LabelColor[],
    startDate?: number,
    endDate?: number,
    subtasks?: Subtask[],
  ): Promise<boolean> {
    try {
      await api.put<IAPIResult<Card>>(`${API_URL}/cards`, {
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
      alert(
        error.response?.data?.error ||
          "Failed to update card. Please try again.",
      );
      return false;
    }
  },

  async removeCard(
    id: string,
    columnId: string,
    boardId: string,
  ): Promise<boolean> {
    try {
      await api.delete<IAPIResult<Card>>(`${API_URL}/cards/`, {
        data: { id, columnId, boardId },
      });

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to remove card. Please try again.",
      );
      return false;
    }
  },

  async moveCard(
    boardId: string,
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    position: number,
  ): Promise<boolean> {
    try {
      await api.put<IAPIResult<Card>>(`${API_URL}/cards/move`, {
        boardId,
        cardId,
        sourceColumnId,
        targetColumnId,
        position,
      });

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error || "Failed to move card. Please try again.",
      );
      return false;
    }
  },
};
