// Los colores del tema Surco viven copiados en tres lugares (MapLibre no lee variables CSS).
// Esta prueba avisa si alguna copia se desfasa del tema generado en design-tokens/build/surco.css.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TOKENS } from "../lib/colores.ts";

const app = path.resolve(import.meta.dirname, "..");
const leer = (...partes: string[]) => fs.readFileSync(path.join(...partes), "utf8");

/** Variables `--nombre: #HEX;` de un bloque CSS */
function variables(css: string): Record<string, string> {
  return Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map(([, n, v]) => [n, v.toUpperCase()]));
}

const NOMBRE_CSS: Record<keyof typeof TOKENS, string> = {
  primary: "primary",
  highlight: "highlight",
  chart3: "chart-3",
  success: "success",
  warning: "warning",
  foreground: "foreground",
  card: "card",
};

test("globals.css usa los mismos colores que el tema Surco", () => {
  const tema = variables(leer(app, "..", "design-tokens", "build", "surco.css"));
  const globales = variables(leer(app, "app", "globals.css"));
  for (const [nombre, valor] of Object.entries(tema)) {
    if (nombre in globales) assert.equal(globales[nombre], valor, `--${nombre} en globals.css`);
  }
});

test("lib/colores.ts copia bien los tokens", () => {
  const globales = variables(leer(app, "app", "globals.css"));
  for (const [clave, css] of Object.entries(NOMBRE_CSS)) {
    assert.equal(TOKENS[clave as keyof typeof TOKENS].toUpperCase(), globales[css], `${clave} (--${css})`);
  }
});

test("el themeColor de layout.tsx es el verde primario", () => {
  const color = leer(app, "app", "layout.tsx").match(/themeColor:\s*"(#[0-9a-fA-F]{6})"/)?.[1];
  assert.equal(color?.toUpperCase(), variables(leer(app, "app", "globals.css")).primary);
});
