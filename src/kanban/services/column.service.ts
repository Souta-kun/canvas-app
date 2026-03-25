import api from "@/lib/api";
import { Column, IAPIResult } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const columnService = {
  async addColumn(boardId: string, title: string): Promise<Column | null> {
    try {
      const response = await api.post<IAPIResult<Column>>(
        `${API_URL}/columns`,
        { boardId, title },
      );

      const { data } = response.data;

      return data || null;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to add column. Please try again.",
      );
      return null;
    }
  },

  async updateColumn(
    id: string,
    boardId: string,
    title: string,
  ): Promise<boolean> {
    try {
      await api.put<IAPIResult<Column>>(`${API_URL}/columns`, {
        id,
        boardId,
        title,
      });

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to update column. Please try again.",
      );
      return false;
    }
  },

  async removeColumn(id: string, boardId: string): Promise<boolean> {
    try {
      await api.delete<IAPIResult<Column>>(`${API_URL}/columns/`, {
        data: { id, boardId },
      });

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to remove column. Please try again.",
      );
      return false;
    }
  },
};
