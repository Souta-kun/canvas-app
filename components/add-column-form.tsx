"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddColumnFormProps {
  onAdd: (title: string) => void
}

export function AddColumnForm({ onAdd }: AddColumnFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")

  function handleSubmit() {
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle("")
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-12 w-[300px] shrink-0 items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:bg-muted/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Agregar lista
      </button>
    )
  }

  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-2 rounded-xl border border-border bg-muted/50 p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nombre de la lista..."
        className="h-9 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit()
          if (e.key === "Escape") {
            setIsOpen(false)
            setTitle("")
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" className="h-8 text-xs" onClick={handleSubmit} disabled={!title.trim()}>
          Agregar lista
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => {
            setIsOpen(false)
            setTitle("")
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
