// Cómo se dibuja cada cultivo en la simulación de la parcela: 7 formas base y, por cultivo, su altura, color y detalle.
// Agregar un cultivo es agregar una línea aquí: no hace falta un dibujo nuevo. Los colores salen de los tokens del tema.
import { NOMBRE_CULTIVO } from "./textos.ts";

export type Forma = "cana" | "macolla" | "mataBaja" | "rastrera" | "tutor" | "roseta" | "arbusto";
export type Detalle = "mazorca" | "panoja" | "capsulas" | "espiga" | "bulbo" | "vainas" | "flor" | "frutoRedondo" | "frutoLargo" | "cabeza" | "ninguno";

export interface AspectoCultivo {
  nombre: string; // en español, para la leyenda
  forma: Forma;
  altura: number; // 0.3–1, relativa a la planta más alta
  hoja: string; // color CSS (token o color-mix)
  detalle: Detalle; // lo que aparece en maduración
  colorDetalle: string;
}

const HOJA = "var(--decor-hoja)";
const VERDE = "var(--primary)";
const SOL = "var(--decor-sol)";
const SUELO = "var(--decor-suelo)";
const ROJO = "var(--highlight)";
const CLARO = "var(--card)";
const mezcla = (a: string, b: string, pct: number) => `color-mix(in oklab, ${a} ${pct}%, ${b})`;

const aspecto = (nombre: string, forma: Forma, altura: number, hoja: string, detalle: Detalle, colorDetalle: string): AspectoCultivo => ({
  nombre,
  forma,
  altura,
  hoja,
  detalle,
  colorDetalle,
});

const ASPECTOS: Record<string, AspectoCultivo> = {
  // Caña: tallo alto con hojas largas
  maize: aspecto("Maíz", "cana", 1, VERDE, "mazorca", SOL),
  sorghum: aspecto("Sorgo (maicillo)", "cana", 0.9, HOJA, "panoja", mezcla(ROJO, SUELO, 55)),
  sesame: aspecto("Ajonjolí", "cana", 0.7, mezcla(HOJA, SOL, 80), "capsulas", mezcla(SOL, SUELO, 60)),
  // Macolla: mata de hojas finas
  rice: aspecto("Arroz", "macolla", 0.5, mezcla(HOJA, SOL, 70), "espiga", SOL),
  onion: aspecto("Cebolla", "macolla", 0.35, mezcla(VERDE, CLARO, 75), "bulbo", mezcla(ROJO, CLARO, 45)),
  // Mata baja
  beans: aspecto("Frijol", "mataBaja", 0.4, VERDE, "vainas", ROJO),
  soybean: aspecto("Soya", "mataBaja", 0.5, HOJA, "vainas", mezcla(SOL, SUELO, 55)),
  peanut: aspecto("Maní", "mataBaja", 0.3, mezcla(HOJA, SOL, 85), "flor", SOL),
  cowpea: aspecto("Caupí (frijol de vara)", "mataBaja", 0.5, mezcla(VERDE, HOJA, 50), "vainas", mezcla(HOJA, CLARO, 60)),
  potato: aspecto("Papa", "mataBaja", 0.4, mezcla(VERDE, SUELO, 85), "flor", CLARO),
  canavalia: aspecto("Canavalia", "mataBaja", 0.6, VERDE, "vainas", HOJA),
  // Rastrera: guía sobre el suelo
  watermelon: aspecto("Sandía", "rastrera", 0.3, VERDE, "frutoRedondo", mezcla(VERDE, SUELO, 70)),
  melon: aspecto("Melón", "rastrera", 0.3, HOJA, "frutoRedondo", mezcla(SOL, CLARO, 60)),
  squash: aspecto("Ayote", "rastrera", 0.35, mezcla(VERDE, HOJA, 50), "frutoRedondo", mezcla(SOL, ROJO, 65)),
  cucumber: aspecto("Pepino", "rastrera", 0.3, HOJA, "frutoLargo", VERDE),
  sweet_potato: aspecto("Camote", "rastrera", 0.3, mezcla(VERDE, ROJO, 85), "ninguno", VERDE),
  mucuna: aspecto("Mucuna (frijol terciopelo)", "rastrera", 0.4, VERDE, "ninguno", VERDE),
  // Mata con tutor
  tomato: aspecto("Tomate", "tutor", 0.65, VERDE, "frutoRedondo", ROJO),
  sweet_pepper: aspecto("Chile dulce", "tutor", 0.55, HOJA, "frutoLargo", mezcla(VERDE, SOL, 60)),
  // Roseta
  cabbage: aspecto("Repollo", "roseta", 0.3, mezcla(HOJA, CLARO, 70), "cabeza", mezcla(HOJA, CLARO, 45)),
  // Arbusto
  cassava: aspecto("Yuca", "arbusto", 0.95, VERDE, "ninguno", VERDE),
  pigeon_pea: aspecto("Gandul (frijol de palo)", "arbusto", 0.85, HOJA, "vainas", mezcla(SOL, SUELO, 55)),
};

export const IDS_CULTIVOS = Object.keys(ASPECTOS);

/** Los ids que el plan usa hoy (en español) apuntan a los del listado. */
export const ALIAS: Record<string, string> = { maiz: "maize", frijol: "beans", sorgo: "sorghum", frijolAbono: "mucuna" };

const conocido = (id: string): AspectoCultivo | undefined => ASPECTOS[ALIAS[id] ?? id];

/** El aspecto de un cultivo. Un id que no está en el listado se dibuja como una mata baja neutra. */
export function aspectoDe(id: string): AspectoCultivo {
  return conocido(id) ?? aspecto(id, "mataBaja", 0.45, HOJA, "ninguno", HOJA);
}

/** El nombre para mostrar: el del plan si existe, si no el del listado, y si es desconocido, su id. */
export function nombreCultivo(id: string): string {
  return (NOMBRE_CULTIVO as Record<string, string>)[id] ?? conocido(id)?.nombre ?? id;
}
