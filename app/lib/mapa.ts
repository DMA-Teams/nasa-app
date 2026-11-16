// Geometría del mapa: cuadrícula de 0.5° sobre Honduras y lugares de referencia.
// Solo importa tipos para que scripts/generar-celdas.ts lo pueda usar con Node.
import type { Celda } from "./tipos";

export const TAM_CELDA = 0.5; // grados
export const LIMITES = { oeste: -89.5, este: -83.0, sur: 13.0, norte: 16.0 };

// Contorno simplificado de Honduras (lon, lat). Sirve para elegir qué cuadros caen en el país.
export const CONTORNO: [number, number][] = [
  [-88.2, 15.72], [-87.95, 15.85], [-87.45, 15.78], [-86.8, 15.78], [-85.95, 15.93], [-85.0, 15.98],
  [-84.3, 15.83], [-83.75, 15.3], [-83.15, 15.0], [-84.0, 14.75], [-84.7, 14.7], [-85.1, 14.3],
  [-85.7, 13.95], [-86.0, 14.05], [-86.4, 13.75], [-86.75, 13.75], [-86.75, 13.3], [-87.3, 12.98],
  [-87.55, 13.15], [-87.8, 13.38], [-88.1, 13.95], [-88.5, 13.85], [-88.9, 14.05], [-89.35, 14.42],
  [-89.15, 14.6], [-89.0, 14.85], [-88.6, 15.2],
];

/** Rectángulo que cubre Honduras, Islas de la Bahía incluidas. Filtro barato para validar pedidos a las API. */
export function enRectanguloHonduras(lat: number, lon: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= 12.9 && lat <= 17.6 && lon >= -89.5 && lon <= -83.0;
}

export function dentroDeHonduras(lon: number, lat: number): boolean {
  let dentro = false;
  for (let i = 0, j = CONTORNO.length - 1; i < CONTORNO.length; j = i++) {
    const [xi, yi] = CONTORNO[i];
    const [xj, yj] = CONTORNO[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/** Centros de los cuadros de 0.5° que caen (al menos en parte) dentro de Honduras. */
export function centrosDeCuadricula(): { lat: number; lon: number }[] {
  const centros = [];
  for (let lat = LIMITES.sur; lat < LIMITES.norte; lat += TAM_CELDA) {
    for (let lon = LIMITES.oeste; lon < LIMITES.este; lon += TAM_CELDA) {
      const muestras = [[0.25, 0.25], [0.1, 0.1], [0.4, 0.1], [0.1, 0.4], [0.4, 0.4]];
      const adentro = muestras.filter(([a, b]) => dentroDeHonduras(lon + a, lat + b)).length;
      if (adentro >= 2) centros.push({ lat: lat + 0.25, lon: lon + 0.25 });
    }
  }
  return centros;
}

// Cabeceras y pueblos de referencia para nombrar cada cuadro
const LUGARES: { nombre: string; departamento: string; lat: number; lon: number }[] = [
  { nombre: "Ocotepeque", departamento: "Ocotepeque", lat: 14.43, lon: -89.18 },
  { nombre: "Santa Rosa de Copán", departamento: "Copán", lat: 14.77, lon: -88.78 },
  { nombre: "Gracias", departamento: "Lempira", lat: 14.59, lon: -88.58 },
  { nombre: "Erandique", departamento: "Lempira", lat: 14.24, lon: -88.47 },
  { nombre: "La Esperanza", departamento: "Intibucá", lat: 14.31, lon: -88.18 },
  { nombre: "Marcala", departamento: "La Paz", lat: 14.15, lon: -88.03 },
  { nombre: "Santa Bárbara", departamento: "Santa Bárbara", lat: 14.92, lon: -88.24 },
  { nombre: "Siguatepeque", departamento: "Comayagua", lat: 14.6, lon: -87.83 },
  { nombre: "Comayagua", departamento: "Comayagua", lat: 14.45, lon: -87.64 },
  { nombre: "San Pedro Sula", departamento: "Cortés", lat: 15.5, lon: -88.03 },
  { nombre: "Puerto Cortés", departamento: "Cortés", lat: 15.85, lon: -87.94 },
  { nombre: "El Progreso", departamento: "Yoro", lat: 15.4, lon: -87.8 },
  { nombre: "Tela", departamento: "Atlántida", lat: 15.78, lon: -87.46 },
  { nombre: "La Ceiba", departamento: "Atlántida", lat: 15.76, lon: -86.79 },
  { nombre: "Yoro", departamento: "Yoro", lat: 15.14, lon: -87.13 },
  { nombre: "Olanchito", departamento: "Yoro", lat: 15.48, lon: -86.57 },
  { nombre: "Tocoa", departamento: "Colón", lat: 15.68, lon: -86.0 },
  { nombre: "Trujillo", departamento: "Colón", lat: 15.92, lon: -85.95 },
  { nombre: "Iriona", departamento: "Colón", lat: 15.94, lon: -85.18 },
  { nombre: "Talanga", departamento: "Francisco Morazán", lat: 14.4, lon: -87.08 },
  { nombre: "Tegucigalpa", departamento: "Francisco Morazán", lat: 14.07, lon: -87.19 },
  { nombre: "Juticalpa", departamento: "Olancho", lat: 14.66, lon: -86.22 },
  { nombre: "Catacamas", departamento: "Olancho", lat: 14.85, lon: -85.89 },
  { nombre: "Gualaco", departamento: "Olancho", lat: 15.1, lon: -86.1 },
  { nombre: "Dulce Nombre de Culmí", departamento: "Olancho", lat: 15.1, lon: -85.54 },
  { nombre: "Danlí", departamento: "El Paraíso", lat: 14.03, lon: -86.58 },
  { nombre: "Yuscarán", departamento: "El Paraíso", lat: 13.94, lon: -86.85 },
  { nombre: "Nacaome", departamento: "Valle", lat: 13.53, lon: -87.49 },
  { nombre: "Choluteca", departamento: "Choluteca", lat: 13.3, lon: -87.19 },
  { nombre: "Wampusirpi", departamento: "Gracias a Dios", lat: 15.16, lon: -84.62 },
  { nombre: "Ahuas", departamento: "Gracias a Dios", lat: 15.48, lon: -84.35 },
  { nombre: "Brus Laguna", departamento: "Gracias a Dios", lat: 15.75, lon: -84.48 },
  { nombre: "Puerto Lempira", departamento: "Gracias a Dios", lat: 15.26, lon: -83.77 },
];

function masCercano(lat: number, lon: number) {
  return LUGARES.reduce((a, l) => ((l.lat - lat) ** 2 + (l.lon - lon) ** 2 < (a.lat - lat) ** 2 + (a.lon - lon) ** 2 ? l : a));
}

export function lugarMasCercano(lat: number, lon: number): string {
  const l = masCercano(lat, lon);
  return `${l.nombre}, ${l.departamento}`;
}

/** El cuadro que contiene un punto, o el más cercano si el punto cae en un borde. */
export function celdaDePunto(celdas: Celda[], lat: number, lon: number): Celda {
  return celdas.reduce((mejor, c) => {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    const dMejor = (mejor.lat - lat) ** 2 + (mejor.lon - lon) ** 2;
    return d < dMejor ? c : mejor;
  });
}
