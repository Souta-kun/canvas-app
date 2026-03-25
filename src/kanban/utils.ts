export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
}

export const LABEL_STYLES: Record<string, string> = {
  blue: "bg-[hsl(var(--label-blue))]",
  green: "bg-[hsl(var(--label-green))]",
  amber: "bg-[hsl(var(--label-amber))]",
  rose: "bg-[hsl(var(--label-rose))]",
  teal: "bg-[hsl(var(--label-teal))]",
};

export const LABEL_NAMES: Record<string, string> = {
  blue: "Urgente",
  green: "Completado",
  amber: "En revisión",
  rose: "Bloqueado",
  teal: "Mejora",
};
