import { AppState } from "@/hooks/use-board";

export function validateAppState(data: any): data is AppState {
  return (
    typeof data === "object" &&
    Array.isArray(data.boards) &&
    typeof data.activeBoardId === "string" &&
    data.boards.every(
      (b: any) =>
        typeof b.id === "string" &&
        typeof b.name === "string" &&
        Array.isArray(b.columns),
    )
  );
}
