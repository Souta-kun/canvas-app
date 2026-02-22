"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  Plus,
  Trash2,
  X,
  AlignLeft,
  ListChecks,
  CalendarRange,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Card, LabelColor, Subtask } from "@/lib/types"

interface CardDetailModalProps {
  card: Card | null
  columnId: string | null
  columnTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (columnId: string, cardId: string, updates: Partial<Omit<Card, "id" | "createdAt">>) => void
  onDelete: (columnId: string, cardId: string) => void
}

const labelConfig: { color: LabelColor; bg: string; ring: string; name: string }[] = [
  { color: "blue", bg: "bg-blue-500", ring: "ring-blue-500", name: "Azul" },
  { color: "green", bg: "bg-emerald-500", ring: "ring-emerald-500", name: "Verde" },
  { color: "amber", bg: "bg-amber-500", ring: "ring-amber-500", name: "Amarillo" },
  { color: "rose", bg: "bg-rose-500", ring: "ring-rose-500", name: "Rosa" },
  { color: "teal", bg: "bg-teal-500", ring: "ring-teal-500", name: "Teal" },
]

export function CardDetailModal({
  card,
  columnId,
  columnTitle,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: CardDetailModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [labels, setLabels] = useState<LabelColor[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [newSubtask, setNewSubtask] = useState("")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (card) {
      setTitle(card.title)
      setDescription(card.description ?? "")
      setLabels([...card.labels])
      setSubtasks(card.subtasks.map((s) => ({ ...s })))
      setStartDate(card.startDate ? new Date(card.startDate) : undefined)
      setEndDate(card.endDate ? new Date(card.endDate) : undefined)
    }
  }, [card])

  if (!card || !columnId) return null

  function save(updates: Partial<Omit<Card, "id" | "createdAt">>) {
    onUpdate(columnId!, card!.id, updates)
  }

  function handleTitleBlur() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== card!.title) {
      save({ title: trimmed })
    } else {
      setTitle(card!.title)
    }
    setIsEditingTitle(false)
  }

  function handleDescriptionBlur() {
    const desc = description.trim() || undefined
    if (desc !== card!.description) {
      save({ description: desc })
    }
  }

  function toggleLabel(color: LabelColor) {
    const next = labels.includes(color) ? labels.filter((c) => c !== color) : [...labels, color]
    setLabels(next)
    save({ labels: next })
  }

  function addSubtask() {
    const trimmed = newSubtask.trim()
    if (!trimmed) return
    const next = [...subtasks, { id: crypto.randomUUID(), title: trimmed, completed: false }]
    setSubtasks(next)
    setNewSubtask("")
    save({ subtasks: next })
  }

  function toggleSubtask(id: string) {
    const next = subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    setSubtasks(next)
    save({ subtasks: next })
  }

  function deleteSubtask(id: string) {
    const next = subtasks.filter((s) => s.id !== id)
    setSubtasks(next)
    save({ subtasks: next })
  }

  function handleStartDate(date: Date | undefined) {
    setStartDate(date)
    save({ startDate: date?.getTime() })
  }

  function handleEndDate(date: Date | undefined) {
    setEndDate(date)
    save({ endDate: date?.getTime() })
  }

  const completedCount = subtasks.filter((s) => s.completed).length
  const subtaskProgress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          {/* Labels row */}
          {labels.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              {labels.map((label) => {
                const cfg = labelConfig.find((l) => l.color === label)
                return (
                  <span
                    key={label}
                    className={cn("h-2 w-10 rounded-full", cfg?.bg)}
                  />
                )
              })}
            </div>
          )}

          {isEditingTitle ? (
            <Input
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleBlur()
                if (e.key === "Escape") {
                  setTitle(card.title)
                  setIsEditingTitle(false)
                }
              }}
              className="text-lg font-semibold border-none px-0 focus-visible:ring-0 h-auto"
              autoFocus
            />
          ) : (
            <DialogTitle
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors text-left"
              onClick={() => {
                setIsEditingTitle(true)
                setTimeout(() => titleInputRef.current?.focus(), 0)
              }}
            >
              {card.title}
            </DialogTitle>
          )}
          <DialogDescription className="text-xs text-muted-foreground">
            En la lista <span className="font-medium text-foreground">{columnTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-6">
          {/* Description */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Descripcion</h4>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Agrega una descripcion mas detallada..."
              className="min-h-[80px] text-sm resize-none leading-relaxed"
            />
          </section>

          {/* Labels */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Etiquetas</h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {labelConfig.map((l) => (
                <button
                  key={l.color}
                  onClick={() => toggleLabel(l.color)}
                  className={cn(
                    "h-7 px-3 rounded-md text-xs font-medium text-card transition-all",
                    l.bg,
                    labels.includes(l.color)
                      ? "ring-2 ring-offset-2 ring-offset-background " + l.ring
                      : "opacity-50 hover:opacity-80"
                  )}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </section>

          {/* Dates */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Fechas</h4>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 gap-2 text-xs font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {startDate
                      ? format(startDate, "dd MMM yyyy", { locale: es })
                      : "Fecha de inicio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDate}
                    initialFocus
                  />
                  {startDate && (
                    <div className="px-3 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => handleStartDate(undefined)}
                      >
                        Quitar fecha
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground text-xs">{"—"}</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 gap-2 text-xs font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {endDate
                      ? format(endDate, "dd MMM yyyy", { locale: es })
                      : "Fecha de fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDate}
                    disabled={startDate ? { before: startDate } : undefined}
                    initialFocus
                  />
                  {endDate && (
                    <div className="px-3 pb-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        onClick={() => handleEndDate(undefined)}
                      >
                        Quitar fecha
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </section>

          {/* Subtasks */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-foreground">Subtareas</h4>
              {subtasks.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {completedCount}/{subtasks.length}
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <Progress value={subtaskProgress} className="h-1.5 mb-3" />
            )}

            <div className="flex flex-col gap-1.5">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={st.completed}
                    onCheckedChange={() => toggleSubtask(st.id)}
                    className="h-4 w-4"
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm leading-relaxed",
                      st.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {st.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => deleteSubtask(st.id)}
                    aria-label={`Eliminar subtarea "${st.title}"`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Agregar subtarea..."
                className="h-8 text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addSubtask()
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs shrink-0"
                onClick={addSubtask}
                disabled={!newSubtask.trim()}
              >
                <Plus className="h-3 w-3" />
                Agregar
              </Button>
            </div>
          </section>

          {/* Delete */}
          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 text-xs"
              onClick={() => {
                onDelete(columnId!, card!.id)
                onOpenChange(false)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar tarjeta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
