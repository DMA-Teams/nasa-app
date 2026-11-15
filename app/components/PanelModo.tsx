// "¿Cómo quieres tu plan?": la app recomienda o el agricultor dice qué siembra.
import { DibujoCultivo } from "./dibujos";
import { IconoSol } from "./ui";

interface Props {
  onRecomendado: () => void;
  onMisCultivos: () => void;
}

const ESTILO_TARJETA =
  "flex min-h-28 items-center gap-4 rounded-3xl border-[3px] px-4 py-4 text-left transition-[transform,border-color] duration-150 ease-out-strong active:scale-[0.97]";

export function PanelModo({ onRecomendado, onMisCultivos }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-titulo font-semibold">¿Cómo quieres tu plan?</h2>

      <button type="button" onClick={onRecomendado} className={`${ESTILO_TARJETA} border-primary bg-decor-verde-suave`}>
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <IconoSol className="size-9" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-subtitulo leading-tight font-semibold">Recomiéndame</span>
          <span className="text-cuerpo leading-snug">La app elige qué sembrar con los datos de NASA de tu lugar.</span>
        </span>
      </button>

      <button type="button" onClick={onMisCultivos} className={`${ESTILO_TARJETA} border-border bg-card`}>
        <span className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-background">
          <DibujoCultivo id="maiz" className="size-12" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-subtitulo leading-tight font-semibold">Yo elijo mis cultivos</span>
          <span className="text-cuerpo leading-snug">Tú dices qué siembras y armamos el plan con eso.</span>
        </span>
      </button>
    </div>
  );
}
