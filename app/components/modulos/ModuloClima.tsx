// Módulo 1: cómo es el clima de la zona, con datos de NASA POWER.
import { listaMeses, MESES_LARGOS } from "@/lib/textos";
import type { ClimaZona } from "@/lib/tipos";
import { Escena } from "../dibujos";
import { GraficaMensual } from "../GraficaMensual";
import { IconoAlerta } from "../ui";

export function ModuloClima({ clima }: { clima: ClimaZona }) {
  const m = clima.meses;
  const max = m.reduce((a, b) => (b.lluvia > a.lluvia ? b : a));

  const meses = listaMeses(clima.mesesDificiles);
  const titulo =
    clima.tipo === "seca"
      ? `Aquí falta agua en ${meses || "julio"}`
      : clima.tipo === "lluviosa"
        ? meses
          ? `Aquí sobra agua en ${meses}`
          : "Aquí sobra agua casi todo el año"
        : "Aquí la lluvia es bastante pareja";

  // Junio sin lluvia (dato raro o faltante) haría dividir entre cero: entonces no se da el porcentaje
  const menosQueJunio = m[5].lluvia > 0 ? Math.round((1 - m[6].lluvia / m[5].lluvia) * 100) : null;
  const explicacion =
    clima.tipo === "seca"
      ? `En julio llueven ${m[6].lluvia} mm${menosQueJunio !== null && menosQueJunio > 0 ? `, un ${menosQueJunio} % menos que en junio (${m[5].lluvia} mm)` : ` y en junio ${m[5].lluvia} mm`}. Es la canícula, y llega cuando el maíz más agua necesita.`
      : clima.tipo === "lluviosa"
        ? `En ${MESES_LARGOS[max.mes - 1]} llueven ${max.lluvia} mm. Con tanta agua, la tierra desnuda se lava y el frijol se pudre.`
        : `En julio llueven ${m[6].lluvia} mm y en junio ${m[5].lluvia} mm. La canícula se siente poco aquí.`;

  return (
    <div className="flex flex-col gap-4">
      <Escena tipo={clima.tipo} className="h-28" />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-titulo font-semibold text-balance">{titulo}</h1>
        <p className="text-cuerpo">{explicacion}</p>
      </div>

      <GraficaMensual meses={m} resaltados={clima.mesesDificiles} tipo={clima.tipo} />

      {clima.tipo !== "lluviosa" && (
        <div className="flex items-center gap-3 rounded-xl bg-zona-seca/35 px-4 py-3 text-cuerpo leading-snug">
          <IconoAlerta className="size-6 shrink-0 text-highlight" />
          <span>
            <strong>{clima.peorAnio.anio} fue el peor año:</strong> solo {clima.peorAnio.lluvia} mm en julio y agosto.
          </span>
        </div>
      )}

      <p className="text-nota text-muted-foreground">
        Fuente: {clima.dataset} ({clima.variables.join(", ")}), {clima.periodo.inicio.slice(0, 4)}–{clima.periodo.fin.slice(0, 4)}.{" "}
        {clima.fuente === "en-vivo" ? "Consulta en vivo." : `Datos de respaldo guardados el ${clima.consultado}.`}
      </p>
    </div>
  );
}
