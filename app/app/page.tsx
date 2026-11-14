import { Explorador } from "@/components/Explorador";
import celdas from "@/public/fallback/celdas.json";
import type { Celda } from "@/lib/tipos";

export default function Inicio() {
  return <Explorador celdas={celdas as Celda[]} />;
}
