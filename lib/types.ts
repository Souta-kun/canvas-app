export type LabelColor = "blue" | "green" | "amber" | "rose" | "teal"

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Card {
  id: string
  title: string
  description?: string
  labels: LabelColor[]
  subtasks: Subtask[]
  startDate?: number
  endDate?: number
  createdAt: number
}

export interface Column {
  id: string
  title: string
  cards: Card[]
}

export interface Board {
  id: string
  name: string
  columns: Column[]
}
