// Si algo se rompe (por ejemplo, el mapa no termina de descargarse con mala señal),
// se muestra esto en vez de una pantalla en blanco, con un botón para volver a intentar.
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { BotonPrimario } from "@/components/ui";

export default function ErrorApp({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-5">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-3xl bg-card p-6">
        <Image src="/marca/surco-horizontal-color.svg" alt="Surco" width={102} height={32} />
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-titulo font-semibold text-balance">Algo no cargó bien</h1>
          <p className="text-cuerpo text-muted-foreground">
            Puede ser la señal de internet. Vuelve a intentar; lo que elegiste se empieza de nuevo.
          </p>
        </div>
        <BotonPrimario onClick={reset}>Intentar de nuevo</BotonPrimario>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 self-center px-3 text-apoyo text-primary underline-offset-4 hover:underline"
        >
          Recargar la página
        </button>
      </div>
    </main>
  );
}
