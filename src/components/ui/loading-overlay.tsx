import { Loader2 } from "lucide-react";

import { useKanban } from "@/kanban/context";
import { cn } from "@/lib/utils";

type LoadingOverlayProps = {
  className?: string;
};

function LoadingOverlay({ className }: LoadingOverlayProps) {
  const { state } = useKanban();

  if (!state.loading) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200",
        className,
      )}
    >
      <div className="flex items-center justify-center rounded-full bg-background/10 p-4 text-white shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

export { LoadingOverlay };
