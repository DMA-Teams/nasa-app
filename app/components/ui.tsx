// Piezas pequeñas reutilizables: botones, chips e íconos (trazos SVG, sin librerías).
import type { ComponentProps, ReactNode } from "react";
import type { CultivoId, Semaforo, TipoZona } from "@/lib/tipos";

export function BotonPrimario({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-5 text-[17px] font-semibold text-primary-foreground transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}

export function BotonSecundario({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 text-base font-semibold text-foreground transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}

const ESTILO_ZONA: Record<TipoZona, string> = {
  seca: "bg-zona-seca/50 text-[color-mix(in_oklab,var(--highlight)_80%,var(--foreground))]",
  equilibrada: "bg-zona-equilibrada/60 text-primary",
  lluviosa: "bg-zona-lluviosa/50 text-[color-mix(in_oklab,var(--chart-3)_75%,var(--foreground))]",
};
const TEXTO_ZONA: Record<TipoZona, string> = { seca: "Falta agua", equilibrada: "Equilibrado", lluviosa: "Sobra agua" };

export function ChipZona({ tipo }: { tipo: TipoZona }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILO_ZONA[tipo]}`}>{TEXTO_ZONA[tipo]}</span>;
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-semibold text-foreground">{children}</span>;
}

export const COLOR_SEMAFORO: Record<Semaforo, string> = {
  verde: "var(--risk-low)",
  amarillo: "var(--risk-medium)",
  rojo: "var(--risk-high)",
};
export const TEXTO_SEMAFORO: Record<Semaforo, string> = { verde: "Sana", amarillo: "Regular", rojo: "En riesgo" };

export function Foco({ semaforo, tam = 32 }: { semaforo: Semaforo; tam?: number }) {
  const color = COLOR_SEMAFORO[semaforo];
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{ width: tam, height: tam, background: color, boxShadow: `0 0 0 5px color-mix(in oklab, ${color} 18%, transparent)` }}
    />
  );
}

/* Íconos de trazo, 24×24 */
function Icono({ children, className = "size-5" }: { children: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconoAtras = (p: { className?: string }) => <Icono {...p}><path d="M15 18l-6-6 6-6" /></Icono>;
export const IconoBuscar = (p: { className?: string }) => <Icono {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Icono>;
export const IconoUbicar = (p: { className?: string }) => <Icono {...p}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></Icono>;
export const IconoBrote = (p: { className?: string }) => <Icono {...p}><path d="M12 21V11" /><path d="M12 11c0-4 3-7 8-7 0 5-3 8-8 7z" /><path d="M12 15c0-3-2-5-6-5 0 4 2 6 6 5z" /></Icono>;
export const IconoAlerta = (p: { className?: string }) => <Icono {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Icono>;
export const IconoInfo = (p: { className?: string }) => <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icono>;
export const IconoMensaje = (p: { className?: string }) => <Icono {...p}><path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" /></Icono>;
export const IconoCheck = (p: { className?: string }) => <Icono {...p}><path d="M5 12l5 5 9-10" /></Icono>;
export const IconoCubo = (p: { className?: string }) => <Icono {...p}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></Icono>;

export function IconoCultivo({ id, className = "size-9" }: { id: CultivoId; className?: string }) {
  switch (id) {
    case "maiz":
      return <Icono className={`${className} text-chart-5`}><path d="M12 3c2.5 0 4 3.5 4 8s-1.5 8-4 8-4-3.5-4-8 1.5-8 4-8z" /><path d="M8.5 8h7M8 11h8M8.5 14h7" /><path d="M8 17c-2.5 0-4 2-4 4M16 17c2.5 0 4 2 4 4" /></Icono>;
    case "frijol":
      return <Icono className={`${className} text-chart-4`}><path d="M7 5.5c3-2.5 9-1.5 10.5 3 1.2 3.6-1.8 5-3 7-2 3.5-8 3.8-9.3-.8C4.2 11 4.6 7.5 7 5.5z" /><path d="M10 9c1.5-1 3-.6 3.5.5" /></Icono>;
    case "sorgo":
      return <Icono className={`${className} text-highlight`}><path d="M12 22V11" /><circle cx="12" cy="4" r="1.6" /><circle cx="9.8" cy="6.6" r="1.6" /><circle cx="14.2" cy="6.6" r="1.6" /><circle cx="12" cy="9" r="1.6" /><path d="M12 17c-3-.5-5-2.5-6-5.5M12 15c2.5-.5 4.5-2 5.5-4.5" /></Icono>;
    case "frijolAbono":
      return <Icono className={`${className} text-primary`}><path d="M3 20c4-1 6-4 9-4s5 3 9 4" /><path d="M12 16V9" /><path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5zM12 11c0-2.5-2-4-4.5-4 0 2.5 2 4 4.5 4z" /></Icono>;
  }
}
