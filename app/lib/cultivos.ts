export const CULTIVOS = [
  { id: "maiz", api: "maize", nombre: "Maíz", cobertura: false, grupo: "grano" },
  { id: "frijol", api: "beans", nombre: "Frijol", cobertura: false, grupo: "grano" },
  { id: "sorgo", api: "sorghum", nombre: "Sorgo", cobertura: false, grupo: "grano" },
  { id: "arroz", api: "rice", nombre: "Arroz", cobertura: false, grupo: "grano" },
  { id: "mani", api: "peanut", nombre: "Maní", cobertura: false, grupo: "grano" },
  { id: "caupi", api: "cowpea", nombre: "Frijol de vara", cobertura: false, grupo: "grano" },
  { id: "soya", api: "soybean", nombre: "Soya", cobertura: false, grupo: "grano" },
  { id: "ajonjoli", api: "sesame", nombre: "Ajonjolí", cobertura: false, grupo: "grano" },
  { id: "yuca", api: "cassava", nombre: "Yuca", cobertura: false, grupo: "raiz" },
  { id: "camote", api: "sweet_potato", nombre: "Camote", cobertura: false, grupo: "raiz" },
  { id: "papa", api: "potato", nombre: "Papa", cobertura: false, grupo: "raiz" },
  { id: "tomate", api: "tomato", nombre: "Tomate", cobertura: false, grupo: "hortaliza" },
  { id: "chileDulce", api: "sweet_pepper", nombre: "Chile dulce", cobertura: false, grupo: "hortaliza" },
  { id: "cebolla", api: "onion", nombre: "Cebolla", cobertura: false, grupo: "hortaliza" },
  { id: "repollo", api: "cabbage", nombre: "Repollo", cobertura: false, grupo: "hortaliza" },
  { id: "pepino", api: "cucumber", nombre: "Pepino", cobertura: false, grupo: "hortaliza" },
  { id: "sandia", api: "watermelon", nombre: "Sandía", cobertura: false, grupo: "hortaliza" },
  { id: "melon", api: "melon", nombre: "Melón", cobertura: false, grupo: "hortaliza" },
  { id: "ayote", api: "squash", nombre: "Ayote", cobertura: false, grupo: "hortaliza" },
  { id: "frijolAbono", api: "mucuna", nombre: "Frijol abono", cobertura: true, grupo: "abono" },
  { id: "canavalia", api: "canavalia", nombre: "Canavalia", cobertura: true, grupo: "abono" },
  { id: "gandul", api: "pigeon_pea", nombre: "Gandul", cobertura: true, grupo: "abono" },
] as const;

export type CultivoId = (typeof CULTIVOS)[number]["id"];
export type GrupoCultivo = (typeof CULTIVOS)[number]["grupo"];

export const MAXIMO_CULTIVOS_ROTACION = 4;

export const GRUPOS_CULTIVO: { grupo: GrupoCultivo; nombre: string }[] = [
  { grupo: "grano", nombre: "Granos" },
  { grupo: "raiz", nombre: "Raíces y tubérculos" },
  { grupo: "hortaliza", nombre: "Hortalizas y frutas" },
  { grupo: "abono", nombre: "Abonos verdes" },
];

export const NOMBRE_CULTIVO = Object.fromEntries(CULTIVOS.map((c) => [c.id, c.nombre])) as Record<CultivoId, string>;

const cultivoPorIdApi = new Map<string, CultivoId>(CULTIVOS.map((c) => [c.api, c.id]));
const idApiPorCultivo = new Map<CultivoId, string>(CULTIVOS.map((c) => [c.id, c.api]));
const abonosVerdes = new Set<CultivoId>(CULTIVOS.filter((c) => c.cobertura).map((c) => c.id));

export const esCobertura = (id: CultivoId) => abonosVerdes.has(id);

export const cultivoDeApi = (idApi: string): CultivoId | null => cultivoPorIdApi.get(idApi) ?? null;

export const apiDeCultivo = (id: CultivoId): string => idApiPorCultivo.get(id) ?? id;
