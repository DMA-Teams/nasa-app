# Misión Cadete: la idea de un niño convertida en app

Para el demo con niños o para equipos juveniles. La regla: **el niño habla y nosotros no corregimos la idea**, solo le agregamos el reto y los datos de NASA.

Funciona mejor en **Lovable** (genera y publica en un paso). En Claude Code o Codex, la skill `mision-cadete` hace esto automáticamente.

## Paso 1. Escucha la idea y encuentra su reto

| Si el niño dice algo como… | Reto que encaja | Dato NASA fácil |
|---|---|---|
| "Un juego donde tengo una base en Marte / la Luna" | 3 · Junior Astronaut Mission Trainer | Tormentas solares reales (NASA DONKI) |
| "Un juego de armar cohetes o satélites" | 13 · Space Mission Design Game | Masas y potencias reales de CubeSat 101 |
| "Un mapa para explorar Marte" | 11 · Martian Map | Mapas de Mars Trek |
| "Un museo de cosas que dejamos en la Luna" | 1 · Abandoned but not Forgotten | Fotos de NASA Image and Video Library |
| "Que la Tierra suene como música" | 14 · Earth Information Jukebox | Visualizaciones del Earth Information Center |
| "¿Esta foto es de Marte o de la Tierra?" | 10 · Earth Analogs | Fotos de Mars Trek y de la Tierra |
| "Un juego de apagar incendios" | 9 · MODIS/VIIRS Hot Spots | Focos de calor reales de NASA FIRMS |
| Otra cosa | Busca el más cercano en `retos/README.md` | Pregúntale: "¿y dónde pasa eso?" |

## Paso 2. Prompt base (Lovable)

Rellena con las palabras exactas del niño entre comillas.

```
Soy [nombre de pila], tengo [edad] años. Mi idea es: "[IDEA DEL NIÑO, tal cual la dijo]".

Conviértela en un juego web para el reto "[reto]" del NASA Space Apps Challenge 2026.
- Usa datos reales de NASA: [dato NASA de la tabla]. Muestra un cartelito "Dato real de NASA" cuando aparezcan.
- Es para niños de 7 a 12 años: botones enormes, textos de máximo 2 líneas, íconos grandes, sonidos alegres.
- El juego tiene 4 momentos: 1) elijo mi misión, 2) veo los datos de NASA en un panel divertido,
  3) pasa algo por lo que decidí, 4) gano una insignia y puedo volver a jugar.
- Cada decisión tiene una consecuencia y una frase que explica por qué, que sea verdadera.
- Todo en español. Sin registro ni login.

SISTEMA VISUAL (tema "Cadete", modo claro):
Fondo #FFF9EE; tarjetas #FFFFFF; tarjeta elevada #F3EEFF; bordes #E4DCF7.
Texto #1E1B4B; texto secundario #4B5079.
Color principal #5B3DF5 con texto blanco; acento #D6246E con texto blanco.
Éxito #067647, advertencia #B54708, peligro #C01048.
Títulos en Fredoka, texto en Nunito. Esquinas de 16 px. Botones de al menos 56 px de alto para dedos pequeños.
No uses el logo de NASA.
```

## Paso 3. Un solo cambio pedido por el niño

Pregúntale "¿qué le cambiarías?" y escribe su respuesta **tal cual**:

```
[Nombre] quiere este cambio: "[lo que dijo el niño]". Hazlo sin romper lo que ya funciona.
```

## Ejemplo completo: "una base en Marte"

```
Soy Mateo, tengo 8 años. Mi idea es: "un juego donde tengo una base en Marte y tengo que
cuidar a los astronautas de las tormentas del Sol".

Conviértela en un juego web para el reto "Build a Junior Astronaut Mission Trainer" del NASA Space Apps Challenge 2026.
- Usa datos reales de NASA: las llamaradas solares de 2025 registradas en NASA DONKI
  (https://api.nasa.gov/DONKI/notifications?type=FLR&startDate=2025-01-01&endDate=2025-03-31&api_key=DEMO_KEY).
  Cada día del juego es un día real de 2025; si ese día hubo una llamarada, llega una tormenta a la base.
- Recursos de la base: oxígeno, energía, comida y escudo. Ninguna decisión es gratis.
...
```

## Cuidados

- Usa solo el nombre de pila del niño; nunca apellido, escuela ni foto en el prompt.
- Pide permiso a los padres para fotos y transmisiones.
- Ten un **plan B**: una versión ya generada abierta en otra pestaña (ver `demo-nino-8-anios.md`).
