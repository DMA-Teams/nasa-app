import { Explorador } from "@/components/Explorador";
import celdas from "@/public/fallback/celdas.json";
import departamentos from "@/public/fallback/departamentos.json";
import type { Celda, DepartamentosGeoJSON } from "@/lib/tipos";

// Los datos se leen en el servidor y llegan como datos, no dentro del JavaScript de la página
export default function Inicio() {
  return <Explorador celdas={celdas as Celda[]} departamentos={departamentos as DepartamentosGeoJSON} />;
}
