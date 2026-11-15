// Piezas pequeñas reutilizables: botones, chips e íconos (trazos SVG, sin librerías).
import type { ComponentProps, ReactNode } from "react";
import type { TipoZona } from "@/lib/tipos";
import { DibujoClima } from "./dibujos";

export function BotonPrimario({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`flex min-h-15 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 font-display text-xl font-semibold tracking-[-0.015em] text-primary-foreground shadow-[0_4px_0_var(--primary-sombra)] transition-[transform,box-shadow,opacity] duration-150 ease-out-strong active:translate-y-1 active:shadow-[0_0_0_var(--primary-sombra)] disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function BotonSecundario({ className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={`flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 text-[17px] font-semibold text-foreground transition-transform duration-150 ease-out-strong active:scale-[0.97] ${className}`}
      {...props}
    />
  );
}

// Fondo suave y texto oscuro del mismo tono (el texto nunca va solo en color claro)
const ESTILO_ZONA: Record<TipoZona, string> = {
  seca: "bg-zona-seca/45 text-[color-mix(in_oklab,var(--highlight)_70%,var(--foreground))]",
  equilibrada: "bg-zona-equilibrada/55 text-[color-mix(in_oklab,var(--primary)_75%,var(--foreground))]",
  lluviosa: "bg-zona-lluviosa/50 text-[color-mix(in_oklab,var(--chart-3)_70%,var(--foreground))]",
};
const TEXTO_ZONA: Record<TipoZona, string> = { seca: "Falta agua", equilibrada: "Equilibrado", lluviosa: "Sobra agua" };

/** El clima de la zona con su dibujo: sol, sol con nube o lluvia. */
export function ChipZona({ tipo, grande = false }: { tipo: TipoZona; grande?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${ESTILO_ZONA[tipo]} ${
        grande ? "py-1 pr-4 pl-1.5 text-base" : "py-0.5 pr-3 pl-1 text-sm"
      }`}
    >
      <DibujoClima tipo={tipo} className={grande ? "size-8" : "size-6"} />
      {TEXTO_ZONA[tipo]}
    </span>
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
export const IconoUbicar = (p: { className?: string }) => <Icono {...p}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></Icono>;
export const IconoAlerta = (p: { className?: string }) => <Icono {...p}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></Icono>;
export const IconoInfo = (p: { className?: string }) => <Icono {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icono>;
export const IconoDescargar = (p: { className?: string }) => <Icono {...p}><path d="M12 4v11M7 10l5 5 5-5" /><path d="M5 20h14" /></Icono>;
export const IconoCheck = (p: { className?: string }) => <Icono {...p}><path d="M5 12l5 5 9-10" /></Icono>;
export const IconoCubo = (p: { className?: string }) => <Icono {...p}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" /></Icono>;
export const IconoSol = (p: { className?: string }) => <Icono {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></Icono>;
export const IconoCalendario = (p: { className?: string }) => <Icono {...p}><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Icono>;
export const IconoMontana = (p: { className?: string }) => <Icono {...p}><path d="M2 20l7-12 4 6 2.5-3.5L22 20H2z" /></Icono>;
export const IconoGota = (p: { className?: string }) => <Icono {...p}><path d="M12 3c4 5 6.5 8 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 11 8 8 12 3z" /></Icono>;
