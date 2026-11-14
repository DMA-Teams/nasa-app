// Transforma la respuesta de NASA POWER en el clima de una zona.
// Funciones puras: las usan la API (/api/clima) y el script scripts/generar-celdas.ts.
// Ojo: este archivo solo puede importar tipos (`import type`) para que Node lo ejecute sin compilar.
import type { ClimaZona, MesClima, Relieve, ResumenPower, TipoZona } from "./tipos";

export const DATASET = "NASA POWER · comunidad AG · diario";
export const VARIABLES = ["PRECTOTCORR", "EVPTRNS", "T2M_MAX"];
export const INICIO = "20150101";
export const FIN = "20251231";

// EVPTRNS viene en MJ/m²/día, no en mm. Evaporar 1 mm de agua consume ≈ 2.45 MJ/m².
const MJ_POR_MM = 2.45;

// Umbrales de zona, calibrados con los 41 cuadros de Honduras (2015–2025)
const UMBRAL_CANICULA = 0.7; // julio llueve menos del 70 % que junio y septiembre
const UMBRAL_LLUVIOSA = 2000; // mm al año

export function urlPower(lat: number, lon: number): string {
  return (
    "https://power.larc.nasa.gov/api/temporal/daily/point" +
    `?parameters=${VARIABLES.join(",")}&community=AG` +
    `&latitude=${lat}&longitude=${lon}&start=${INICIO}&end=${FIN}&format=JSON`
  );
}

interface RespuestaPower {
  geometry: { coordinates: [number, number, number] };
  properties: { parameter: Record<string, Record<string, number>> };
}

/** Promedia la serie diaria de NASA POWER por mes y suma la lluvia de julio–agosto por año. */
export function resumirPower(json: RespuestaPower): ResumenPower {
  const p = json.properties.parameter;
  const anios = new Set<string>();
  const meses = Array.from({ length: 12 }, () => ({ lluvia: 0, evap: 0, tmax: 0, dias: 0 }));
  const julAgo: Record<string, number> = {};

  for (const fecha of Object.keys(p.PRECTOTCORR)) {
    const lluvia = p.PRECTOTCORR[fecha];
    const evap = p.EVPTRNS[fecha];
    const tmax = p.T2M_MAX[fecha];
    if (lluvia < -900 || evap < -900 || tmax < -900) continue; // -999 = sin dato
    const anio = fecha.slice(0, 4);
    const m = Number(fecha.slice(4, 6)) - 1;
    anios.add(anio);
    meses[m].lluvia += lluvia;
    meses[m].evap += evap / MJ_POR_MM;
    meses[m].tmax += tmax;
    meses[m].dias++;
    if (m === 6 || m === 7) julAgo[anio] = (julAgo[anio] ?? 0) + lluvia;
  }

  const n = anios.size;
  return {
    elevacion: Math.round(json.geometry.coordinates[2]),
    mensual: meses.map((m) => ({
      lluvia: Math.round(m.lluvia / n),
      evaporacion: Math.round(m.evap / n),
      tempMax: Math.round((m.tmax / m.dias) * 10) / 10,
    })),
    julAgo: Object.fromEntries(Object.entries(julAgo).map(([a, v]) => [a, Math.round(v)])),
  };
}

export function indiceCanicula(lluviaMensual: number[]): number {
  const referencia = (lluviaMensual[5] + lluviaMensual[8]) / 2; // junio y septiembre
  return Math.round((lluviaMensual[6] / referencia) * 100) / 100;
}

export function clasificarZona(lluviaMensual: number[]): TipoZona {
  const anual = lluviaMensual.reduce((a, b) => a + b, 0);
  if (anual >= UMBRAL_LLUVIOSA) return "lluviosa";
  if (indiceCanicula(lluviaMensual) < UMBRAL_CANICULA) return "seca";
  return "equilibrada";
}

export function relieveDe(elevacion: number): Relieve {
  if (elevacion < 300) return "bajo";
  if (elevacion < 800) return "medio";
  return "montana";
}

/** Meses que más aprietan: la canícula en zonas secas, los aguaceros en zonas lluviosas. */
export function mesesDificiles(lluviaMensual: number[], tipo: TipoZona): number[] {
  const promedio = lluviaMensual.reduce((a, b) => a + b, 0) / 12;
  if (tipo === "lluviosa") {
    return lluviaMensual.flatMap((v, i) => (v >= promedio * 1.3 ? [i + 1] : []));
  }
  // La canícula: julio y agosto, si llueve mucho menos que en junio y septiembre
  const referencia = (lluviaMensual[5] + lluviaMensual[8]) / 2;
  return [6, 7].flatMap((i) => (lluviaMensual[i] < referencia * 0.75 ? [i + 1] : []));
}

export function construirClima(
  lat: number,
  lon: number,
  resumen: ResumenPower,
  fuente: ClimaZona["fuente"],
  consultado: string,
): ClimaZona {
  const meses: MesClima[] = resumen.mensual.map((m, i) => ({
    mes: i + 1,
    ...m,
    balance: m.lluvia - m.evaporacion,
  }));
  const lluvias = meses.map((m) => m.lluvia);
  const tipo = clasificarZona(lluvias);
  const porAnio = Object.entries(resumen.julAgo)
    .map(([anio, lluvia]) => ({ anio: Number(anio), lluvia }))
    .sort((a, b) => a.anio - b.anio);
  const peorAnio = porAnio.reduce((peor, a) => (a.lluvia < peor.lluvia ? a : peor), porAnio[0]);

  return {
    lat,
    lon,
    dataset: DATASET,
    variables: VARIABLES,
    periodo: { inicio: "2015-01-01", fin: "2025-12-31" },
    consultado,
    fuente,
    elevacion: resumen.elevacion,
    relieve: relieveDe(resumen.elevacion),
    meses,
    lluviaAnual: lluvias.reduce((a, b) => a + b, 0),
    tipo,
    indiceCanicula: indiceCanicula(lluvias),
    mesesDificiles: mesesDificiles(lluvias, tipo),
    lluviaJulAgoPorAnio: porAnio,
    peorAnio,
  };
}
