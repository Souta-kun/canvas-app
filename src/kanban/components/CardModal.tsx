import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar, Plus, Save, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useKanban } from "../context";
import { useCardService } from "../services/card.service";
import { Card as CardType, LabelColor, Subtask } from "../types";
import { generateId, LABEL_NAMES, LABEL_STYLES } from "../utils";

const ALL_LABELS: LabelColor[] = ["blue", "green", "amber", "rose", "teal"];

interface CardModalProps {
  card: CardType | null;
  columnId: string | null;
  boardId: string;
  open: boolean;
  onClose: () => void;
}

export function CardModal({
  card,
  columnId,
  boardId,
  open,
  onClose,
}: CardModalProps) {
  const { dispatch } = useKanban();
  const cardService = useCardService();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [labels, setLabels] = useState<LabelColor[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setLabels([...card.labels]);
      setStartDate(
        card.startDate
          ? new Date(card.startDate).toISOString().split("T")[0]
          : "",
      );
      setEndDate(
        card.endDate ? new Date(card.endDate).toISOString().split("T")[0] : "",
      );
      setSubtasks([...card.subtasks]);
    }
  }, [card]);

  if (!card || !columnId) return null;

  const save = (updates: Partial<CardType>) => {
    dispatch({
      type: "UPDATE_CARD",
      payload: { columnId, cardId: card.id, updates },
    });
  };

  const handleSave = async () => {
    const success = await cardService.updateCard(
      card.id,
      columnId,
      boardId,
      title,
      description,
      labels,
      startDate ? new Date(startDate).getTime() : undefined,
      endDate ? new Date(endDate).getTime() : undefined,
      subtasks,
    );

    if (success) {
      save({
        title,
        description,
        labels,
        startDate: startDate ? new Date(startDate).getTime() : undefined,
        endDate: endDate ? new Date(endDate).getTime() : undefined,
        subtasks,
      });
      onClose();
    }
  };

  const toggleLabel = (label: LabelColor) => {
    const next = labels.includes(label)
      ? labels.filter((l) => l !== label)
      : [...labels, label];
    setLabels(next);
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    if (field === "startDate") setStartDate(value);
    else setEndDate(value);
  };

  const addSubtask = () => {
    const t = newSubtaskTitle.trim();
    if (!t) return;
    const subtask: Subtask = { id: generateId(), title: t, completed: false };
    setSubtasks((prev) => [...prev, subtask]);
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks((prev) =>
      prev.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s,
      ),
    );
  };

  const deleteSubtask = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
  };

  const deleteCard = async () => {
    const response = await cardService.removeCard(card.id, columnId, boardId);

    if (response) {
      dispatch({ type: "DELETE_CARD", payload: { columnId, cardId: card.id } });
      onClose();
    }
  };

  const completed = card.subtasks.filter((s) => s.completed).length;
  const total = card.subtasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto kanban-scrollbar">
        <DialogHeader>
          <DialogTitle className="sr-only">Editar tarjeta</DialogTitle>
        </DialogHeader>

        {/* Title */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 h-auto"
          placeholder="Título"
        />

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Descripción
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Agrega una descripción..."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" /> Etiquetas
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_LABELS.map((label) => (
              <button
                key={label}
                onClick={() => toggleLabel(label)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium text-white transition-all",
                  LABEL_STYLES[label],
                  labels.includes(label)
                    ? "opacity-100 ring-2 ring-offset-2 ring-offset-background"
                    : "opacity-40 hover:opacity-70",
                )}
              >
                {LABEL_NAMES[label]}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="text-sm h-9"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Vencimiento
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="text-sm h-9"
            />
          </div>
        </div>

        {/* Subtasks */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Subtareas {total > 0 && `(${completed}/${total})`}
          </label>
          {total > 0 && <Progress value={progress} className="h-1.5" />}
          <div className="space-y-1">
            {subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 group py-1">
                <Checkbox
                  checked={st.completed}
                  onCheckedChange={() => toggleSubtask(st.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    st.completed && "line-through text-muted-foreground",
                  )}
                >
                  {st.title}
                </span>
                <button
                  onClick={() => deleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Nueva subtarea..."
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={addSubtask}
              className="h-8"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Delete */}
        <div className="pt-2 border-t flex justify-between">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1.5"
            onClick={deleteCard}
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar tarjeta
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:text-foreground hover:bg-foreground/10 text-xs gap-1.5"
            onClick={handleSave}
          >
            <Save className="w-3.5 h-3.5" /> Guardar tarjeta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
