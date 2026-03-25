import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent, type ReactNode } from "react";
import { useKanban } from "../context";

export function KeyGate({ children }: { children: ReactNode }) {
  const { state, dispatch } = useKanban();
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value) return;

    dispatch({ type: "SET_KEY", payload: { key: Number(value) } });
    setValue("");
  };

  if (state.key !== null) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            Ingresa la key
          </h1>
          <p className="text-sm text-muted-foreground">
            Debes ingresar tu key para acceder al tablero.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            autoFocus
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Clave numérica"
            type="password"
            value={value}
            onChange={(event) => {
              const nextValue = event.target.value.replace(/\D/g, "");
              setValue(nextValue);
            }}
          />

          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
