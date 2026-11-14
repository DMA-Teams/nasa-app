# 13 · Space Mission Design Game

**Nivel:** Intermedio · Principiante/Juvenil · **Temas:** Juegos
**Tema visual:** `cadete` (para niños) o `marte` (para jóvenes) · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/

## Qué pide NASA

Un juego interactivo en el que los participantes diseñan y administran una misión espacial completa: objetivo, requisitos, nave, instrumentos, lanzador y órbita, con límites de presupuesto, masa, energía, comunicaciones, datos y vida útil. Puede ser individual o en equipos de hasta cuatro, y debe mostrar cómo cada decisión afecta al resto de la misión.

## Bájalo a una persona

- **Persona:** estudiante de bachillerato técnico que sueña con trabajar en el espacio.
- **Situación:** cree que "hacer un satélite" es armar una caja con una antena.
- **Dificultad:** no ve los compromisos reales: más cámara = más masa = lanzador más caro.
- **Consecuencia:** no imagina una carrera de ingeniería aeroespacial desde Honduras.

Gancho local: Honduras ya construyó su primer CubeSat (Morazán-Sat). **Verifica los datos antes de usarlos en el pitch.**

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| CubeSat 101 (NASA) | Masas, potencias y costos reales para las reglas | https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf |
| Design and Develop Science Missions | Fases reales de una misión | https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf |
| NASA Mission Viz | Visualizar la misión | https://nasa.github.io/mission-viz/ |
| Juego "Build it yourself" del Webb | Referencia de juego educativo | https://science.nasa.gov/mission/webb/game-build-it-yourself/ |

Pon los números del juego (masas, vatios, costos) en un JSON con su fuente: así el jurado ve que no son inventados.

## Las 4 pantallas

1. **Entrada:** elige el objetivo (observar la Tierra, estudiar el Sol, ir a la Luna) y el presupuesto.
2. **Procesamiento:** taller de diseño: arrastra instrumentos, paneles y antena; barras de masa, energía y costo con datos de NASA.
3. **Resultado:** simulación de la misión: lanzamiento, órbita y datos obtenidos o fallo explicado ("te quedaste sin energía en la sombra de la Tierra").
4. **Acción:** puntuación, comparar con tu equipo e intentar otra configuración.

## Según tu equipo

- **Cadete:** "un juego de armar cohetes y satélites y ver si llegan".
- **Nivel 2 (Stitch):** las 4 pantallas con tarjetas de componentes.
- **Nivel 3 (Lovable):** taller con drag and drop + reglas en JSON.
- **Dev:** modelo simple de presupuesto de potencia y enlace (data budget), modo multijugador local.

## Semilla para el prompt

```
Reto: Space Mission Design Game (NASA Space Apps 2026).
Jugador: [estudiante de bachillerato / niño de 10 años].
Componentes: [cámara, espectrómetro, panel solar, batería, antena] con masa, energía y costo de CubeSat 101.
Restricciones: presupuesto, masa máxima del lanzador, energía en eclipse.
Momento de valor: el jugador ve fallar su misión por una decisión y entiende por qué.
```

## Trampas comunes

- Demasiadas variables: con 5 componentes y 3 restricciones ya hay juego.
- No mostrar consecuencias: el aprendizaje está en el "por qué falló".
