const URL_POR_DEFECTO = "http://127.0.0.1:8080";
const ESPERA_MS = 10000;

export const urlBackend = (ruta: string) => `${(process.env.NASA_API_URL ?? URL_POR_DEFECTO).replace(/\/$/, "")}${ruta}`;

export class ErrorBackend extends Error {
  constructor(
    readonly status: number,
    readonly tipo: string,
  ) {
    super(`backend respondió ${status} ${tipo}`);
  }
}

export async function pedirBackend<T>(ruta: string, ipCliente?: string | null): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (ipCliente) headers["X-Forwarded-For"] = ipCliente;
  const res = await fetch(urlBackend(ruta), { headers, signal: AbortSignal.timeout(ESPERA_MS) });
  if (!res.ok) {
    const problema = (await res.json().catch(() => ({}))) as { type?: string };
    throw new ErrorBackend(res.status, problema.type ?? "");
  }
  return res.json() as Promise<T>;
}

export function sinAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

const NOMBRES_EN_GEOBOUNDARIES: Record<string, string> = {
  "islas de la bahia": "bay islands",
};

export const nombreEnBackend = (departamento: string) => {
  const limpio = sinAcentos(departamento);
  return NOMBRES_EN_GEOBOUNDARIES[limpio] ?? limpio;
};
