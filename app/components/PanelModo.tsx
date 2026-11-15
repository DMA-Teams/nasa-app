// "¿Cómo quieres tu plan?": la app recomienda o el agricultor dice qué siembra.
import { DibujoClima, DibujoCultivo } from "./dibujos";

interface Props {
  onRecomendado: () => void;
  onMisCultivos: () => void;
}

// Borde fino; la opción recomendada lleva el borde verde
const ESTILO_TARJETA =
  "flex min-h-24 items-center gap-4 rounded-2xl border bg-card px-4 py-4 text-left transition-[transform,border-color] duration-150 ease-out-strong active:scale-[0.98]";

export function PanelModo({ onRecomendado, onMisCultivos }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-titulo font-semibold">¿Cómo quieres tu plan?</h1>

      <button type="button" onClick={onRecomendado} className={`${ESTILO_TARJETA} border-primary`}>
        <DibujoClima tipo="equilibrada" className="size-10" />
        <span className="flex flex-col gap-0.5">
          <span className="text-subtitulo leading-tight font-semibold">Recomiéndame</span>
          <span className="text-apoyo leading-snug text-muted-foreground">La app elige qué sembrar con los datos de NASA de tu lugar.</span>
        </span>
      </button>

      <button type="button" onClick={onMisCultivos} className={`${ESTILO_TARJETA} border-border hover:border-primary/40`}>
        <DibujoCultivo id="maiz" className="size-10 shrink-0" />
        <span className="flex flex-col gap-0.5">
          <span className="text-subtitulo leading-tight font-semibold">Yo elijo mis cultivos</span>
          <span className="text-apoyo leading-snug text-muted-foreground">Tú dices qué siembras y armamos el plan con eso.</span>
        </span>
      </button>
    </div>
  );
}
