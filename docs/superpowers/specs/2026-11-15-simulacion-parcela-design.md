# Simulación visual de la parcela ("Ver mi parcela en el año")

Fecha: 2026-11-15 · Rama: `visual-crop-simulation` · Estado: **aprobado e implementado** (con los tres ajustes de la sección 11)

## 1. Qué es y para qué

Al final de "Tu plan del año", un botón abre una vista animada de la parcela que recorre los 12 meses del plan. El agricultor no solo lee su plan: ve cómo se vería su tierra si lo siguiera.

Es una experiencia **solo visual e ilustrativa**. No calcula, no predice y no pide datos nuevos.

## 2. Metas, no-metas y lo que la haría fracasar

**Metas**

- Mostrar el año completo del plan, y también por semestres o trimestres.
- Mostrar cada cultivo pasando por sus etapas: preparación, siembra, germinación, crecimiento, maduración y cosecha.
- Mostrar la secuencia entre cultivos (maíz y luego frijol en la misma tierra) y los cultivos que conviven.
- Línea de tiempo con reproducir, pausar, avanzar y retroceder, e indicador del periodo.
- El terreno se reconoce como el mismo de principio a fin.
- Soportar los 22 cultivos del listado (sección 6).

**No-metas**

- Agregar los 22 cultivos al plan (reglas de siembra, tipos). Va aparte; ver sección 10.
- Tamaño de parcela, rendimientos, costos o cualquier cálculo.
- Guardar, exportar o incluir la simulación en el PDF.
- Vista 3D con cámara libre.

**Lo que la haría fracasar aunque funcione**

- Que cambie o rompa el flujo actual del plan.
- Que muestre como hecho algo que el plan no dice (una fecha de germinación, una actividad inventada).
- Que se trabe en un celular modesto durante el demo.

## 3. Cómo está el plan hoy (lo que se reutiliza)

- `PlanAnual.meses` (`app/lib/tipos.ts`) tiene 12 `MesPlan`. Cada uno trae `cultivos` (en el terreno), `sembrados`, `cosechados`, `lluvia` (NASA POWER) y `dificil`.
- `agruparPlan(plan, division)` (`app/lib/plan.ts`) arma los trimestres (`T1`–`T4`) y semestres (`S1`, `S2`) con su nombre ("Ene – Mar").
- `filasCalendario(plan)` da, por cultivo, el estado de cada mes: siembra, terreno o cosecha.
- La resolución es **mensual**. El plan no tiene preparación del terreno, germinación ni distribución espacial de la parcela.
- Todo el plan va marcado "(simulado)" y la interfaz está en español.

## 4. Caminos considerados

| Camino | A favor | En contra |
|---|---|---|
| **SVG isométrico en React, sin dependencias (elegido)** | Liviano, bueno en celular, usa los tokens del tema y el estilo de `dibujos.tsx`, respeta "reducir movimiento", lógica pura y probable | Unas 100–150 plantas en pantalla como máximo |
| Canvas 2D con bucle de animación | Más plantas, crecimiento cuadro a cuadro | Más código, colores del tema leídos desde JS, accesibilidad aparte |
| 3D con three.js | La más vistosa | Dependencia pesada, choca con el estilo, riesgo en el demo |

Reparto del terreno: se eligió **un solo terreno compartido** (surcos alternados para cultivos simultáneos, el siguiente cultivo ocupa la misma tierra) en lugar de franjas fijas por cultivo.

## 5. Diseño

### 5.1 Integración (lo único que toca código existente)

- `ModuloPlan.tsx`: un botón secundario "Ver mi parcela en el año" encima de "Guardar como PDF", un estado local `simulacionAbierta` y el componente `<SimulacionParcela plan={plan} division={division} lugar={lugar} onCerrar={…} />`.
- Nada más cambia: ni `Explorador.tsx`, ni `plan.ts`, ni los tipos, ni la API.
- La simulación se abre en un `<dialog>` nativo a pantalla completa (`showModal()`): queda sobre el mapa y el panel, atrapa el foco, cierra con Esc y con un botón "Volver al plan". El plan no se desmonta ni se vuelve a pedir.
- El diálogo lleva `print:hidden` para no afectar el PDF.

### 5.2 Lógica pura: `app/lib/simulacion.ts`

Funciones sin React, probadas con `node --test` igual que `plan.ts`.

**Ciclos.** `ciclosDelPlan(plan)` recorre los meses y devuelve un ciclo por cada siembra: `{ cultivo, mesSiembra, meses[] }`. Empieza donde el cultivo aparece en `sembrados` y sigue (dando la vuelta de diciembre a enero) hasta el mes en que aparece en `cosechados`. Un cultivo con dos siembras al año da dos ciclos.

**Carriles.** `asignarCarriles(ciclos)` decide qué surcos ocupa cada ciclo:

- Ordena los ciclos por mes de siembra y le da a cada uno el primer carril cuyos ciclos no comparten ningún mes con él.
- El número de carriles es el máximo de cultivos simultáneos del año y no cambia durante la reproducción.
- El surco `i` pertenece al carril `i mod carriles`.
- Resultado: maíz (may–ago) y frijol (sep–nov) caen en el mismo carril, así que el frijol nace en los surcos donde estuvo el maíz. Maíz y sorgo simultáneos quedan en surcos alternados.

**Tiempo.** El año se divide en 48 pasos (4 por mes). `estadoEn(ciclo, paso)` devuelve la etapa y un avance de 0 a 1 dentro del ciclo.

**Etapas.** El plan solo fija el mes de siembra y el de cosecha. Lo demás se reparte dentro de la duración real del ciclo, sin agregar meses:

| Etapa | Cuándo | Origen |
|---|---|---|
| Preparación | Primer paso del mes de siembra: la tierra pasa de descanso a surcos | Transición genérica |
| Siembra | Resto del mes de siembra: montículos con semilla | Plan |
| Germinación | Inicio de los meses intermedios: brote | Transición genérica |
| Crecimiento | Meses intermedios: la planta sube | Transición genérica |
| Maduración | Último tramo antes de la cosecha: aparece el fruto o la espiga | Transición genérica |
| Cosecha | Mes de cosecha: las plantas se retiran y queda rastrojo | Plan |

Después de la cosecha, el rastrojo se desvanece a tierra en descanso. Si un carril queda libre durante todo el ciclo de un cultivo vecino, ese cultivo también lo ocupa (y deja ahí su rastrojo). Si ningún cultivo puede ocuparlo, sus surcos se ven como tierra en descanso.

**Honestidad.** El texto en pantalla solo nombra lo que el plan dice: "Se siembra: maíz", "Se cosecha: frijol", "En el terreno: sorgo". El frijol abono no se cosecha: dice "Se corta: frijol abono", igual que el resto de la app. Las etapas intermedias se ven pero no se rotulan con fecha. La vista lleva "(simulado)" y la nota "Ilustración de tu plan. No es una predicción."

### 5.3 Aspecto de los cultivos: `app/lib/aspecto-cultivos.ts`

No se dibujan 22 especies a mano. Hay **7 formas base**, cada una con sus etapas, y cada cultivo es una línea de configuración: `{ forma, altura, colorHoja, detalle, colorDetalle }`. Los colores salen de los tokens (`--decor-hoja`, `--decor-sol`, `--decor-suelo`, `--primary`, `--highlight`) y mezclas con `color-mix`, como en `dibujos.tsx`.

| Forma | Cultivos | Detalle que los distingue |
|---|---|---|
| Caña (tallo alto, hojas largas) | maize, sorghum, sesame | mazorca · panoja rojiza · cápsulas |
| Macolla (mata de hojas finas) | rice, onion | espiga dorada · bulbo asomado |
| Mata baja | beans, soybean, peanut, cowpea, potato, canavalia | vainas · vainas velludas · flor amarilla · vaina larga · flor blanca · hoja grande |
| Rastrera (guía sobre el suelo) | watermelon, melon, squash, cucumber, sweet_potato, mucuna | fruto rayado · fruto crema · fruto naranja · fruto alargado · hoja en corazón · cobertura densa sin fruto |
| Mata con tutor | tomato, sweet_pepper | fruto rojo · fruto verde |
| Roseta | cabbage | cabeza redonda |
| Arbusto | cassava, pigeon_pea | hoja palmeada · vainas en lo alto |

- La configuración es `Record<string, AspectoCultivo>`, sin depender de `CultivoId`. Así no se tocan los tipos del plan.
- Alias para los 4 ids actuales: `maiz → maize`, `frijol → beans`, `sorgo → sorghum`, `frijolAbono → mucuna`.
- Un id desconocido usa una mata baja neutra en vez de fallar.
- Los nombres visibles salen de `NOMBRE_CULTIVO` cuando existe; para los ids nuevos, la configuración trae el nombre en español del listado.

### 5.4 Componentes: `app/components/simulacion/`

| Archivo | Qué hace |
|---|---|
| `SimulacionParcela.tsx` | El diálogo. Guarda el paso actual, si está reproduciendo y la vista (año, semestres, trimestres). Calcula ciclos y carriles una sola vez con `useMemo`. |
| `Terreno.tsx` | SVG isométrico: rombo de tierra con 8 surcos × 10 plantas (80 plantas), dibujadas de atrás hacia adelante. Posiciones con una pequeña variación fija por índice, igual en cada mes. |
| `Planta.tsx` | Las 7 formas. Recibe aspecto, etapa y avance. |
| `LineaTiempo.tsx` | Controles e indicador. |

**Animación.** Cada planta es un grupo SVG que crece desde la base con `transform: scale()`; el fruto y el rastrojo entran con `opacity`. Solo se animan `transform` y `opacity`, con transición CSS entre pasos (`ease-out-strong`). No hay bucle por cuadro: un temporizador avanza un paso cada ~400 ms.

**Lluvia (dato NASA en la escena).** El cielo sobre el terreno muestra la lluvia del mes en tres niveles (poca, regular, mucha) según `MesPlan.lluvia`, con el valor en mm. Los meses difíciles se marcan como en el calendario. Al pie va la misma línea de fuente que ya usa el plan: dataset, periodo y fecha de consulta.

### 5.5 Pantalla

```
┌──────────────────────────────────────────────────────┐
│ ← Volver al plan      Tu parcela en el año (simulado)│
│ Gracias, Lempira                                     │
│                                                      │
│              ☁ Lluvia: 182 mm                        │
│                 ◇◇◇◇◇◇◇◇                             │
│              ◇ 🌽 🌿 🌽 🌿 ◇        terreno          │
│            ◇ 🌽 🌿 🌽 🌿 🌽 ◇       isométrico       │
│              ◇◇◇◇◇◇◇◇◇◇                              │
│                                                      │
│ Junio · Abr – Jun                                    │
│ En el terreno: maíz, sorgo                           │
│                                                      │
│ [ Año ] [ Semestres ] [ Trimestres ]                 │
│ ⏮  ▶  ⏭   E F M A M J J A S O N D                    │
│           ─────────●───────────────                  │
│ Leyenda: 🌽 Maíz  🌿 Sorgo  🫘 Frijol                │
│ Ilustración de tu plan. No es una predicción.        │
│ Lluvia: NASA POWER, promedio 2015–2025 …             │
└──────────────────────────────────────────────────────┘
```

**Controles**

- **Vista:** Año, Semestres o Trimestres. Abre en Año y en el primer mes que tiene algo en el terreno. En Año se reproduce de enero a diciembre; en las otras, solo el periodo elegido.
- **⏮ ⏭:** en Año saltan un mes; en Semestres o Trimestres pasan al periodo anterior o siguiente.
- **▶ / ⏸:** reproduce el tramo y se detiene al final. Si ya está al final, vuelve a empezar el tramo.
- **Barra:** un `<input type="range">` (funciona con teclado y lector de pantalla), con las 12 iniciales de los meses y los meses difíciles sombreados.
- **Indicador:** mes actual y nombre del periodo, más lo que el plan dice de ese mes.

**Accesibilidad y celular**

- Con "reducir movimiento" no hay transiciones ni reproducción automática de entrada; los pasos cambian al instante.
- El SVG lleva una descripción en texto del mes actual (`aria-live="polite"`, sin anunciar cada paso mientras reproduce).
- Botones de al menos 44 px. En celular, el terreno arriba y los controles abajo, al alcance del pulgar.

## 6. Listado de cultivos soportados

maize, beans, sorghum, rice, peanut, cowpea, soybean, sesame, cassava, sweet_potato, potato, tomato, sweet_pepper, onion, cabbage, cucumber, watermelon, melon, squash, mucuna, canavalia, pigeon_pea.

## 7. Pruebas

`app/tests/simulacion.test.ts`:

- Los ciclos salen bien para las tres zonas del plan recomendado, incluido el que cruza de diciembre a marzo.
- Un cultivo con dos siembras da dos ciclos.
- Carriles: maíz y luego frijol comparten carril; maíz y sorgo simultáneos no.
- Etapas: el mes de siembra da preparación y siembra; el de cosecha da cosecha; fuera del ciclo no hay planta.
- Los 22 ids y los 4 alias tienen aspecto; un id desconocido usa el genérico.

Revisión manual: abrir la simulación con el caso de "Ver ejemplo" en ancho de celular y de escritorio, en las tres vistas, y con "reducir movimiento" activo.

## 8. Orden de implementación

1. `lib/simulacion.ts` con sus pruebas (ciclos, carriles, etapas).
2. `lib/aspecto-cultivos.ts` con sus pruebas (22 cultivos y alias).
3. `Planta.tsx`: las 7 formas con sus etapas.
4. `Terreno.tsx`: rombo, surcos y plantas para un paso fijo.
5. `LineaTiempo.tsx` y `SimulacionParcela.tsx`: tiempo, vistas, reproducción, lluvia y textos.
6. Botón y diálogo en `ModuloPlan.tsx`.
7. Pulido: reducir movimiento, celular, lector de pantalla.
8. Verificación: en `app/`, `npm test`, `npm run lint`, `npm run typecheck` y `npm run build`; en la raíz, `npm run check`.

## 9. Lo que queda a criterio de quien construye

- El trazo exacto de cada forma y sus proporciones.
- Los valores finos de duración y curva de las transiciones.
- Cuántas plantas por surco si 80 se ve apretado en celular.

## 10. Decisiones mías que puedes corregir

1. **Los 22 cultivos no se agregan al plan en esta rama.** La simulación los soporta todos, pero hoy solo aparecerán los 4 que el plan genera. Los otros 18 se verán cuando entren a `reglas.json` y a los tipos, en un trabajo aparte.
2. **Ids.** El listado usa ids en inglés (`maize`) y el código actual usa español (`maiz`). La simulación acepta ambos mediante alias.
3. **`frijolAbono` se dibuja como mucuna.**
4. **Nombre en español:** "Ver mi parcela en el año", en vez de "Visualize Your Farm", porque toda la interfaz está en español.
5. **La preparación del terreno ocurre al inicio del mes de siembra**, no en un mes anterior, para no inventar una actividad con fecha.
6. **La lluvia del mes se muestra en la escena**, aunque no estaba en tu pedido, porque es el dato NASA del plan.
7. **La simulación no entra al PDF.**

## 11. Ajustes hechos durante la implementación

1. **Surcos libres.** Un cultivo que va solo (el frijol después del maíz y el sorgo) ocupa también los surcos que quedaron libres. Con el diseño original salía en la mitad de los surcos y parecía que el plan dejaba media parcela vacía. Límite conocido: si el carril vecino se traslapa aunque sea un mes, no se presta, y esos surcos se ven en descanso.
2. **Arranque.** La simulación abre en la vista Año y en el primer mes con algo sembrado. Abrir en el primer trimestre mostraba solo tierra vacía durante cinco segundos en las zonas seca y equilibrada.
3. **Frijol abono.** El texto dice "Se corta" en lugar de "Se cosecha".
4. **Más explicación en pantalla** (pedido tras probarla). El mes va en grande sobre la parcela con "Mes N de 12" y etiquetas de lo que pasa (Siembra, Cosecha, Corte, Creciendo, lluvia). El panel lista cada cultivo con su situación del mes ("Se siembra este mes", "En el terreno · se cosecha en agosto", "Ya salió del terreno") y muestra el calendario de siembra del plan con el mes actual marcado. La reproducción pasa de 400 a 500 ms por paso. `CalendarioCultivos` recibe un `mesActual` opcional; sin él se ve igual que antes.
