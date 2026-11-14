# 3 · Build a Junior Astronaut Mission Trainer

**Nivel:** Intermedio · Principiante/Juvenil · **Temas:** Juegos, Planetas y Lunas, Software, Exploración, Sol
**Tema visual:** `cadete` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/

## Qué pide NASA

Un juego o app para niños de **7 a 12 años** en el que administran una base en la Luna o en Marte y deciden sobre soporte vital, blindaje contra radiación, energía, producción de comida y retraso de comunicaciones. Ninguna decisión es gratis, y cada consecuencia enseña algo verdadero. NASA anima a usar datos reales, por ejemplo **DONKI** para tormentas solares.

## Bájalo a una persona

- **Persona:** niña de 9 años en San Pedro Sula a la que le encantan los videojuegos.
- **Situación:** los juegos "del espacio" que conoce son de disparos.
- **Dificultad:** nada le muestra que ser astronauta es tomar decisiones difíciles con recursos limitados.
- **Consecuencia:** no conecta lo que aprende en Ciencias con algo emocionante.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| DONKI: avisos de llamaradas (≥ M5) | Eventos de radiación en el juego basados en llamaradas reales | `https://api.nasa.gov/DONKI/notifications?type=FLR&startDate=2025-01-01&endDate=2025-03-31&api_key=DEMO_KEY` |
| DONKI: CME y tormentas geomagnéticas | Más eventos reales | `https://api.nasa.gov/DONKI/CME?startDate=2025-01-01&endDate=2025-03-31&api_key=DEMO_KEY` · cambia `CME` por `GST` |
| DONKI directo (CCMC) | Lista completa de llamaradas con su clase | `https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=2025-01-01&endDate=2025-12-31` |
| RadLab (OSDR) | Dosis de radiación medidas para calibrar el daño | https://visualization.osdr.nasa.gov/radlab/gui/data-api/ |
| Mars Trek | Terreno real para el mapa de la base | https://trek.nasa.gov/mars/ |
| CSA: producción de comida en la Luna | Reglas creíbles de invernadero | https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/ |

El 14 de noviembre de 2026, `api.nasa.gov/DONKI/FLR` respondía 404, mientras que `notifications`, `CME` y `GST` funcionaban. **Descarga los eventos a un JSON antes del hackathon** y el juego no dependerá de la API. `DEMO_KEY` tiene un límite bajo de llamadas: pide tu clave gratis en https://api.nasa.gov/.

**Idea creativa:** "Modo Sol real". Cada día del juego corresponde a un día real de 2025, y si DONKI registró una llamarada fuerte o una tormenta geomagnética ese día, llega una tormenta a la base.

## Las 4 pantallas

1. **Entrada:** elige Luna o Marte, nombre de la base y tripulación.
2. **Procesamiento:** el panel de la base con medidores (oxígeno, energía, comida, escudo) y la alerta de clima espacial con "Fuente: NASA DONKI".
3. **Resultado:** qué pasó por tu decisión: "Pusiste energía en el escudo: la tripulación está a salvo, pero el invernadero se enfrió".
4. **Acción:** siguiente día (sol), insignia o reiniciar con otra estrategia.

## Según tu equipo

- **Cadete (niño):** "un juego donde tengo una base en Marte y tengo que cuidar a los astronautas de las tormentas del Sol". Ver `prompts/mision-cadete.md`.
- **Nivel 2 (Stitch):** 4 pantallas con medidores grandes y tema `cadete`.
- **Nivel 3 (Lovable):** motor de reglas simple en el frontend + JSON de eventos DONKI ya descargado.
- **Dev:** máquina de estados determinista, balance con pocos parámetros y un modo "explicar por qué" basado en hechos de NASA.

## Semilla para el prompt

```
Reto: Build a Junior Astronaut Mission Trainer (NASA Space Apps 2026), para niños de 7 a 12 años.
Base en: [Luna / Marte]. Recursos: oxígeno, energía, comida, escudo de radiación.
Datos: tormentas solares reales de NASA DONKI (avisos de llamaradas y tormentas geomagnéticas de 2025) como eventos del juego.
Regla: ninguna decisión es gratis; cada consecuencia se explica con una frase verdadera.
Momento de valor: llega una tormenta solar real y el niño decide cómo proteger a su tripulación.
```

## Trampas comunes

- Una hoja de cálculo con estrellitas: debe *sentirse* como un juego (sonido, animación, recompensa).
- Reglas inventadas que contradicen la ciencia: usa valores aproximados pero defendibles.
- Textos largos: los niños no leen párrafos. Máximo dos líneas por mensaje.
