import api from "@/lib/api";
import { Board, BoardListItem, IAPIResult } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const boardService = {
  async loadBoardList(): Promise<BoardListItem[]> {
    try {
      const response = await api.get<IAPIResult<BoardListItem[]>>(
        `${API_URL}/boards`,
      );

      const { data } = response.data;

      return data || [];
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to load board list. Please try again.",
      );
      return [];
    }
  },

  async loadBoard(id: string): Promise<Board | null> {
    try {
      const response = await api.get<IAPIResult<Board>>(
        `${API_URL}/boards/${id}`,
      );

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

  async addBoard(name: string): Promise<Board | null> {
    try {
      const response = await api.post<IAPIResult<Board>>(`${API_URL}/boards`, {
        name,
      });

      const { data } = response.data;

      return data || null;
    } catch (error) {
      alert(
        error.response?.data?.error || "Failed to add board. Please try again.",
      );
      return null;
    }
  },

  async updateBoard(id: string, name: string): Promise<boolean> {
    try {
      await api.put<IAPIResult<Board>>(`${API_URL}/boards`, { id, name });

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to update board. Please try again.",
      );
      return false;
    }
  },

  async removeBoard(id: string): Promise<boolean> {
    try {
      await api.delete<IAPIResult<Board>>(`${API_URL}/boards/${id}`);

      return true;
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Failed to remove board. Please try again.",
      );
      return false;
    }
  },
};
