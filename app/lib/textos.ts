// Textos compartidos: meses y nombres de cultivos. Sin imports de runtime,
// para que lo usen las pantallas, el motor y las pruebas (node --test).
import type { CultivoId, TipoZona } from "./tipos";

export const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** [7, 8] → "julio y agosto" */
export function listaMeses(meses: number[]): string {
  const nombres = meses.map((m) => MESES_LARGOS[m - 1]);
  if (nombres.length <= 1) return nombres[0] ?? "";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

/** Cómo se llaman los meses difíciles marcados en las gráficas (pantalla y PDF). */
export const nombreMesesDificiles = (tipo: TipoZona) => (tipo === "lluviosa" ? "Meses de aguaceros fuertes" : "Meses de canícula");

export const NOMBRE_CULTIVO: Record<CultivoId, string> = {
  maiz: "Maíz",
  frijol: "Frijol",
  sorgo: "Sorgo",
  frijolAbono: "Frijol abono",
};

export const nombresCultivos = (ids: CultivoId[]) => ids.map((id) => NOMBRE_CULTIVO[id]).join(" + ");
