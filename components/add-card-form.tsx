"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { LabelColor } from "@/lib/types"

interface AddCardFormProps {
  columnId: string
  onAdd: (columnId: string, title: string, description?: string, labels?: LabelColor[]) => void
}

const availableLabels: { color: LabelColor; bg: string; name: string }[] = [
  { color: "blue", bg: "bg-blue-500", name: "Azul" },
  { color: "green", bg: "bg-emerald-500", name: "Verde" },
  { color: "amber", bg: "bg-amber-500", name: "Amarillo" },
  { color: "rose", bg: "bg-rose-500", name: "Rosa" },
  { color: "teal", bg: "bg-teal-500", name: "Teal" },
]

export function AddCardForm({ columnId, onAdd }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [labels, setLabels] = useState<LabelColor[]>([])

  function toggleLabel(color: LabelColor) {
    setLabels((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(columnId, trimmed, undefined, labels.length > 0 ? labels : undefined)
    setTitle("")
    setLabels([])
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Agregar tarjeta
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titulo de la tarjeta..."
        className="min-h-[68px] text-sm resize-none"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
          if (e.key === "Escape") {
            setIsOpen(false)
            setTitle("")
            setLabels([])
          }
        }}
      />
      <div className="flex items-center gap-1">
        {availableLabels.map((l) => (
          <button
            key={l.color}
            onClick={() => toggleLabel(l.color)}
            className={cn(
              "h-4 w-8 rounded-sm transition-all",
              l.bg,
              labels.includes(l.color) ? "ring-2 ring-ring ring-offset-1 ring-offset-background" : "opacity-40 hover:opacity-70"
            )}
            aria-label={`Etiqueta ${l.name}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={!title.trim()}>
          Agregar
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
            setLabels([])
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
