"use client"

import { GripVertical, CalendarIcon, ListChecks } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Card, LabelColor } from "@/lib/types"

interface BoardCardProps {
  card: Card
  columnId: string
  onDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void
  onCardClick: (card: Card, columnId: string) => void
}

const labelStyles: Record<LabelColor, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  teal: "bg-teal-500",
}

export function BoardCard({ card, columnId, onDragStart, onCardClick }: BoardCardProps) {
  const completedSubtasks = card.subtasks.filter((s) => s.completed).length
  const totalSubtasks = card.subtasks.length
  const hasDateRange = card.startDate || card.endDate

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id, columnId)}
      onClick={() => onCardClick(card, columnId)}
      className={cn(
        "group relative cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-all",
        "hover:border-muted-foreground/30 hover:shadow-md",
        "active:cursor-grabbing active:shadow-lg active:scale-[1.02]"
      )}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {card.labels.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label}
              className={cn("h-1.5 w-8 rounded-full", labelStyles[label])}
            />
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-card-foreground leading-snug">
        {card.title}
      </p>

      {card.description && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {card.description}
        </p>
      )}

      {/* Meta info row */}
      {(totalSubtasks > 0 || hasDateRange) && (
        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          {hasDateRange && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {card.startDate && format(new Date(card.startDate), "dd MMM", { locale: es })}
              {card.startDate && card.endDate && " - "}
              {card.endDate && format(new Date(card.endDate), "dd MMM", { locale: es })}
            </span>
          )}
          {totalSubtasks > 0 && (
            <span
              className={cn(
                "flex items-center gap-1 text-[11px]",
                completedSubtasks === totalSubtasks
                  ? "text-emerald-600"
                  : "text-muted-foreground"
              )}
            >
              <ListChecks className="h-3 w-3" />
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
