import React from "react";
import { Card as CardType, LabelColor } from "../types";
import { LABEL_STYLES } from "../utils";
import { MessageSquare, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  card: CardType;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

export const KanbanCard = React.memo(function KanbanCard({ card, onClick, onDragStart }: KanbanCardProps) {
  const completedCount = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;

  return (
    <div
      draggable
      data-card-id={card.id}
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-card rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow border border-border/60 group active:scale-[0.98] transition-transform"
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {card.labels.map((label: LabelColor) => (
            <div key={label} className={cn("h-1.5 w-8 rounded-full", LABEL_STYLES[label])} />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-card-foreground leading-snug mb-2">{card.title}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-muted-foreground">
        {card.description && <MessageSquare className="w-3.5 h-3.5" />}
        {totalSubtasks > 0 && (
          <span className={cn("flex items-center gap-1 text-xs", completedCount === totalSubtasks && "text-primary")}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedCount}/{totalSubtasks}
          </span>
        )}
        {card.endDate && (
          <span className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            {new Date(card.endDate).toLocaleDateString("es", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
});
