// Genera design-tokens/build/ a partir de design-tokens/tokens.json y valida contraste WCAG.
// Uso: node scripts/build-tokens.mjs        (genera y valida)
//      node scripts/build-tokens.mjs --check (solo valida; falla si build/ está desactualizado)

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(root, "design-tokens/tokens.json"), "utf8"));
const outDir = join(root, "design-tokens/build");
const checkOnly = process.argv.includes("--check");

// ---------- Contraste WCAG 2.x ----------
function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [frente, fondo, mínimo, uso]
function contrastPairs(c) {
  const pairs = [
    ["foreground", "background", 7, "texto principal"],
    ["foreground", "surface", 7, "texto en tarjetas"],
    ["muted", "background", 4.5, "texto secundario"],
    ["muted", "surface", 4.5, "texto secundario en tarjetas"],
    ["muted", "surfaceRaised", 4.5, "texto secundario en hover"],
    ["brandForeground", "brand", 4.5, "texto en botón principal"],
    ["highlightForeground", "highlight", 4.5, "texto en botón de acento"],
    ["brand", "background", 3, "bordes, íconos y foco de marca"],
    ["highlight", "background", 3, "íconos y gráficos de acento"],
    ["border", "background", 1.2, "separadores (decorativo)"],
  ];
  for (const k of ["success", "warning", "danger"]) pairs.push([k, "surface", 4.5, `etiqueta de estado ${k}`]);
  for (const k of ["low", "medium", "high"]) pairs.push([`risk.${k}`, "surface", 4.5, `nivel de riesgo ${k}`]);
  c.chart.forEach((_, i) => pairs.push([`chart.${i}`, "surface", 3, `serie ${i + 1} de gráfica`]));
  return pairs;
}
const pick = (c, key) => key.split(".").reduce((o, k) => o[k], c);

// ---------- Generadores ----------
const fontsFor = (t) => ({ ...tokens.shared.font, ...(t.font ?? {}) });
const stack = (f) => `"${f.family}", ${f.fallback}`;
const googleHref = (fonts) =>
  "https://fonts.googleapis.com/css2?" +
  [fonts.display, fonts.body, fonts.mono].map((f) => `family=${f.google}`).join("&") +
  "&display=swap";

function css(name, t) {
  const c = t.color;
  const f = fontsFor(t);
  const s = tokens.shared;
  const radius = s.radius[t.radius];
  // Colores de ilustración (opcionales): solo para dibujos, nunca para texto, por eso no se valida su contraste
  const decor = Object.entries(c.decor ?? {});
  return `/* Tema ${t.label} · generado por scripts/build-tokens.mjs desde design-tokens/tokens.json. No editar a mano. */
/* ${t.mood} */
/* Fuentes: agrega en <head> → <link rel="stylesheet" href="${googleHref(f)}"> (o usa next/font con las mismas familias). */
/* Uso: pega este archivo en app/globals.css debajo de @import "tailwindcss"; (Next.js + Tailwind v4 + shadcn/ui, igual en v0 y Lovable). */

:root {
  color-scheme: ${t.mode};

  /* Variables de shadcn/ui */
  --background: ${c.background};
  --foreground: ${c.foreground};
  --card: ${c.surface};
  --card-foreground: ${c.foreground};
  --popover: ${c.surface};
  --popover-foreground: ${c.foreground};
  --primary: ${c.brand};
  --primary-foreground: ${c.brandForeground};
  --secondary: ${c.surfaceRaised};
  --secondary-foreground: ${c.foreground};
  --muted: ${c.surfaceRaised};
  --muted-foreground: ${c.muted};
  --accent: ${c.surfaceRaised};
  --accent-foreground: ${c.foreground};
  --destructive: ${c.danger};
  --border: ${c.border};
  --input: ${c.border};
  --ring: ${c.brand};
${c.chart.map((v, i) => `  --chart-${i + 1}: ${v};`).join("\n")}
  --radius: ${radius};

  /* Extras de Space Apps Starter */
  --highlight: ${c.highlight};
  --highlight-foreground: ${c.highlightForeground};
  --success: ${c.success};
  --warning: ${c.warning};
  --risk-low: ${c.risk.low};
  --risk-medium: ${c.risk.medium};
  --risk-high: ${c.risk.high};
  --ease-out-strong: ${s.motion.easeOut};
  --ease-in-out-strong: ${s.motion.easeInOut};
  --duration-fast: ${s.motion.fast};
  --duration-base: ${s.motion.base};
  --duration-slow: ${s.motion.slow};
  --touch-target: ${s.touchTarget};${decor.map(([k, v]) => `
  --decor-${k}: ${v};`).join("")}
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
${c.chart.map((_, i) => `  --color-chart-${i + 1}: var(--chart-${i + 1});`).join("\n")}
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-risk-low: var(--risk-low);
  --color-risk-medium: var(--risk-medium);
  --color-risk-high: var(--risk-high);${decor.map(([k]) => `
  --color-decor-${k}: var(--decor-${k});`).join("")}
  --font-display: ${stack(f.display)};
  --font-sans: ${stack(f.body)};
  --font-mono: ${stack(f.mono)};
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 6px);
  --ease-out-strong: var(--ease-out-strong);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
}

function promptSpec(name, t) {
  const c = t.color;
  const f = fontsFor(t);
  const r = tokens.shared.radius[t.radius];
  return `<!-- Generado por scripts/build-tokens.mjs. No editar a mano. -->
# Tema ${t.label} · bloque para pegar en tu prompt

Úsalo en Google Stitch, Lovable o v0. Copia el bloque completo al final de tu primer prompt.

**Ideal para:** ${t.useFor.join(", ")}.

\`\`\`
SISTEMA VISUAL (tema "${t.label}", modo ${t.mode === "dark" ? "oscuro" : "claro"}):
Ambiente: ${t.mood}
Colores (usa exactamente estos hex):
- Fondo ${c.background}; tarjetas ${c.surface}; tarjeta elevada/hover ${c.surfaceRaised}; bordes ${c.border}.
- Texto principal ${c.foreground}; texto secundario ${c.muted}.
- Color de marca (botón principal, enlaces, foco) ${c.brand} con texto ${c.brandForeground} encima.
- Acento (una sola llamada a la acción o dato clave por pantalla) ${c.highlight} con texto ${c.highlightForeground} encima.
- Estados: éxito ${c.success}, advertencia ${c.warning}, peligro ${c.danger}.
- Niveles de riesgo: bajo ${c.risk.low}, medio ${c.risk.medium}, alto ${c.risk.high}. Siempre con texto ("Riesgo alto"), nunca solo color.
- Series de gráficas en este orden: ${c.chart.join(", ")}.
Tipografía: títulos en ${f.display.family}; texto en ${f.body.family}; números y datos en ${f.mono.family}.
Forma: esquinas de ${r}, espaciado en múltiplos de 8 px, botones de al menos 44 px de alto.
Movimiento: transiciones cortas (150–300 ms) con salida suave; respeta "reducir movimiento".
No uses el logo de NASA ni imágenes con marca registrada; usa íconos simples y fotos de dominio público citadas.
\`\`\`
`;
}

// ---------- Ejecución ----------
let failures = 0;
const outputs = {};
for (const [name, t] of Object.entries(tokens.themes)) {
  console.log(`\nTema ${t.label} (${name})`);
  for (const [fg, bg, min, use] of contrastPairs(t.color)) {
    const ratio = contrast(pick(t.color, fg), pick(t.color, bg));
    const ok = ratio >= min;
    if (!ok) failures++;
    console.log(`  ${ok ? "ok " : "MAL"} ${ratio.toFixed(2).padStart(5)} ≥ ${min}  ${fg} sobre ${bg} (${use})`);
  }
  outputs[`${name}.css`] = css(name, t);
  outputs[`${name}.prompt.md`] = promptSpec(name, t);
}

if (failures) {
  console.error(`\n${failures} par(es) no cumplen contraste. Ajusta design-tokens/tokens.json.`);
  process.exit(1);
}

if (checkOnly) {
  const stale = Object.entries(outputs).filter(
    ([file, body]) => !existsSync(join(outDir, file)) || readFileSync(join(outDir, file), "utf8") !== body,
  );
  if (stale.length) {
    console.error(`\nbuild/ desactualizado: ${stale.map(([f]) => f).join(", ")}. Corre npm run tokens.`);
    process.exit(1);
  }
  console.log("\nContraste correcto y build/ al día.");
} else {
  mkdirSync(outDir, { recursive: true });
  for (const [file, body] of Object.entries(outputs)) writeFileSync(join(outDir, file), body);
  console.log(`\nGenerados ${Object.keys(outputs).length} archivos en design-tokens/build/.`);
}
