// Contrato de datos compartido entre el mapa, la API, el motor y las pantallas.
// Si cambias algo aquí, avisa al equipo: las tres partes dependen de estos tipos.

export type TipoZona = "seca" | "equilibrada" | "lluviosa";
export type Relieve = "bajo" | "medio" | "montana";
export type CapaMapa = "clima" | "altura";

/** Promedio de un mes (2015–2025) en un cuadro. Todo en milímetros, salvo la temperatura. */
export interface MesClima {
  mes: number; // 1 = enero
  lluvia: number;
  evaporacion: number; // EVPTRNS convertido de MJ/m²/día a mm
  balance: number; // lluvia − evaporación
  tempMax: number; // °C, promedio de las máximas diarias
}

/** Resumen de NASA POWER de un cuadro, tal como lo guarda el script y lo calcula la API. */
export interface ResumenPower {
  elevacion: number; // metros, altura promedio del cuadro según NASA POWER
  mensual: Omit<MesClima, "mes" | "balance">[]; // 12 elementos, enero a diciembre
  julAgo: Record<string, number>; // lluvia de julio + agosto por año
}

/** Un cuadro de ~50 km de la cuadrícula sobre Honduras (lo que pinta el mapa). */
export interface Celda {
  id: string;
  lat: number; // centro
  lon: number;
  lugar: string; // lugar de referencia más cercano
  tipo: TipoZona;
  relieve: Relieve;
  elevacion: number;
  lluviaAnual: number;
  resumen: ResumenPower; // respaldo si NASA POWER no responde
}

/** Datos de cada departamento para pintar el mapa (promedio de los cuadros que caen dentro). */
export interface PropiedadesDepartamento {
  nombre: string;
  tipo: TipoZona;
  relieve: Relieve;
  elevacion: number;
  lluviaAnual: number;
  centro: [number, number]; // lon, lat (para la etiqueta)
}

export interface DepartamentosGeoJSON {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    properties: PropiedadesDepartamento;
    geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
  }[];
}

/** El lugar que eligió el agricultor: un punto exacto del mapa. */
export interface Punto {
  lat: number;
  lon: number;
  departamento: string;
  pueblo: string; // pueblo de referencia más cercano
  celda: Celda; // cuadro de NASA POWER más cercano (respaldo)
}

/** Lo que devuelve /api/clima para un punto. */
export interface ClimaZona {
  lat: number;
  lon: number;
  dataset: string;
  variables: string[];
  periodo: { inicio: string; fin: string };
  consultado: string; // fecha ISO
  fuente: "en-vivo" | "respaldo";
  elevacion: number;
  relieve: Relieve;
  meses: MesClima[];
  lluviaAnual: number;
  tipo: TipoZona;
  /** Lluvia de julio ÷ promedio de junio y septiembre. Menos de 0.7 = canícula fuerte. */
  indiceCanicula: number;
  mesesDificiles: number[]; // 1–12
  lluviaJulAgoPorAnio: { anio: number; lluvia: number }[];
  peorAnio: { anio: number; lluvia: number };
}

export type CultivoId = "maiz" | "frijol" | "sorgo" | "frijolAbono";
export type Prioridad = "agua" | "dinero" | "tierra";
export type Semaforo = "verde" | "amarillo" | "rojo";
export type Nivel = "poco" | "regular" | "bien";

export interface ReglaCultivo {
  id: CultivoId;
  toleraSequia: Nivel;
  toleraEncharcamiento: Nivel;
  mesesCubreSuelo: number;
  aportaNitrogeno: boolean;
  ingreso: "bajo" | "medio" | "alto";
  siembra: Record<TipoZona, number[]>; // meses de siembra según la zona
  duracionMeses: number; // cuánto dura en el terreno
  nota?: Partial<Record<TipoZona, string>>; // por qué va en esa temporada en esa zona
}

export interface Temporada {
  primera: CultivoId[];
  postrera: CultivoId[];
}

export interface Rotacion {
  id: string;
  nombre: string;
  descripcion: string;
  zonas: TipoZona[]; // dónde tiene sentido sugerirla
  anio1: Temporada;
  anio2: Temporada;
}

export interface EvaluacionRotacion {
  rotacion: Rotacion;
  esActual: boolean;
  semaforo: Semaforo;
  puntaje: number; // 0–100
  mesesDesnuda: number;
  aguantaClima: Nivel;
  porque: string;
  evidencia: string;
}

export interface Resultado {
  actual: EvaluacionRotacion;
  opciones: EvaluacionRotacion[]; // 3 opciones, la actual incluida
  sugeridaId: string;
  /** La proyección a 3 años es un índice de reglas, no una medición. */
  proyeccionSimulada: true;
}

export interface FilaPlan {
  anio: 1 | 2;
  temporada: "primera" | "postrera";
  cultivos: CultivoId[];
  mesInicio: number;
  mesFin: number;
}

// ---------- Recorrido nuevo: lugar → información o plan anual ----------
// Contrato con el backend: la API devuelve estos tipos tal cual (ver README, "Contrato con el backend").

/** Un municipio de Honduras. lat/lon es el punto que se usa para pedir el clima. */
export interface Municipio {
  id: string; // código de geoBoundaries si existe, si no un slug
  nombre: string;
  departamento: string; // igual que PropiedadesDepartamento.nombre
  lat: number;
  lon: number;
}

/** El lugar elegido por cualquiera de los 3 caminos: lista, ubicación o mapa. */
export interface Lugar {
  lat: number;
  lon: number;
  departamento: string;
  municipio: string | null; // desde ubicación o mapa: el municipio más cercano de ese departamento
  origen: "lista" | "ubicacion" | "mapa";
  celda: Celda; // cuadro de NASA POWER más cercano (respaldo)
}

export type ModoPlan = "recomendado" | "mis-cultivos";
export type Division = "trimestral" | "semestral";
export type AccionPeriodo = "sembrar" | "cuidar" | "cosechar" | "cubrir" | "descansar";

/** Lo que la app le pide al backend para armar el plan. */
export interface PedidoPlan {
  lat: number;
  lon: number;
  modo: ModoPlan;
  cultivos: CultivoId[]; // vacío si modo = "recomendado"
}

/** Un mes del plan: la unidad base. Los periodos se arman agrupando meses. */
export interface MesPlan {
  mes: number; // 1–12
  cultivos: CultivoId[]; // lo que está en el terreno ese mes ([] = nada)
  accion: AccionPeriodo;
  lluvia: number; // mm, promedio NASA POWER 2015–2025 del lugar
  dificil: boolean; // canícula o aguacero (ClimaZona.mesesDificiles)
  cubierta: boolean; // la tierra tiene algo sembrado
}

/** Un trimestre o semestre ya agrupado, listo para pintar. Lo calcula el frontend. */
export interface PeriodoPlan {
  id: string; // "T1".."T4" o "S1", "S2"
  nombre: string; // "Ene – Mar"
  meses: number[];
  cultivos: CultivoId[];
  accionPrincipal: AccionPeriodo;
  consejo: string;
  lluviaEsperada: number; // mm, suma de los meses
  alerta: string | null;
  mesesCubierta: number;
}

/** El plan de un año. La API devuelve siempre 12 meses; el frontend los agrupa. */
export interface PlanAnual {
  modo: ModoPlan;
  cultivosElegidos: CultivoId[];
  tipoZona: TipoZona;
  meses: MesPlan[]; // 12, de enero a diciembre
  resumen: string;
  fuente: { dataset: string; periodo: string; consultado: string };
  simulado: true; // el calendario de cultivos sale de reglas inventadas
}
