import { cacheLife } from "next/cache";
import type { NextRequest } from "next/server";
import { ErrorBackend, nombreEnBackend, pedirBackend, sinAcentos } from "@/lib/backend";
import type { Municipio } from "@/lib/tipos";

interface DepartamentoApi {
  code: string;
  name: string;
}

interface MunicipioApi {
  code: string;
  name: string;
  departmentCode: string;
  latitude: number;
  longitude: number;
}

async function departamentos(): Promise<DepartamentoApi[]> {
  "use cache";
  cacheLife("hours");
  return (await pedirBackend<{ departments: DepartamentoApi[] }>("/v1/departments")).departments;
}

async function municipiosDe(codigo: string): Promise<MunicipioApi[]> {
  "use cache";
  cacheLife("hours");
  return (await pedirBackend<{ municipalities: MunicipioApi[] }>(`/v1/municipalities?department=${encodeURIComponent(codigo)}`)).municipalities;
}

export async function GET(request: NextRequest) {
  const departamento = request.nextUrl.searchParams.get("departamento")?.trim();
  if (!departamento) return Response.json({ error: "Envía el nombre del departamento" }, { status: 400 });

  try {
    const buscado = nombreEnBackend(departamento);
    const dep = (await departamentos()).find((d) => sinAcentos(d.name) === buscado);
    if (!dep) return Response.json({ error: `Departamento desconocido: ${departamento}` }, { status: 404 });

    const lista: Municipio[] = (await municipiosDe(dep.code))
      .map((m) => ({ id: m.code, nombre: m.name, departamento, lat: m.latitude, lon: m.longitude }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    return Response.json(lista);
  } catch (err) {
    const status = err instanceof ErrorBackend ? err.status : 502;
    console.error("[api/municipios] backend:", (err as Error).message);
    return Response.json({ error: "El servidor de datos no respondió" }, { status: status >= 500 ? status : 502 });
  }
}
