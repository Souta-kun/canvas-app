import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useKanban } from "@/kanban/context";
import { cn } from "@/lib/utils";

type ErrorTooltipProps = {
  message?: string | null;
  duration?: number;
  onClose?: () => void;
  className?: string;
};

export function ErrorTooltip({
  duration = 3000,
  onClose,
  className,
}: ErrorTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const { state, dispatch } = useKanban();

  useEffect(() => {
    if (!state.error) {
      setIsVisible(false);
      dispatch({ type: "SET_ERROR", payload: { error: null } });
      return;
    }

    setCurrentMessage(state.error);
    setIsVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsVisible(false);
      dispatch({ type: "SET_ERROR", payload: { error: null } });
      onClose?.();
    }, duration);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.error, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    dispatch({ type: "SET_ERROR", payload: { error: null } });
    onClose?.();
  };

  if (!isVisible || !currentMessage) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "fixed right-4 top-4 z-50 w-full max-w-sm rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-950 shadow-lg shadow-red-950/10 transition-all duration-200",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Error</p>
          <p className="mt-0.5 break-words text-sm leading-5 text-red-800">
            {currentMessage}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar mensaje de error"
          className="rounded-md p-1 text-red-700 transition-colors hover:bg-red-100 hover:text-red-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
