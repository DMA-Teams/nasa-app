# 1 · Abandoned but not Forgotten

**Nivel:** Intermedio · Principiante/Juvenil · **Temas:** Astrofísica, Planetas y Lunas, Exploración
**Tema visual:** `cadete` (para niños) o `marte` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/ (búscalo por nombre)

## Qué pide NASA

Contar la historia del hardware que NASA ha dejado en la Luna, en Marte y en el espacio profundo (rovers, módulos, sondas) para que estudiantes en edad escolar conozcan ese equipo y la ciencia que hizo posible.

## Bájalo a una persona

- **Persona:** estudiante de 5.º grado de una escuela pública de San Pedro Sula.
- **Situación:** en Ciencias Naturales ve "el sistema solar" en dos páginas del libro.
- **Dificultad:** no hay material en español, interactivo y con historias reales.
- **Consecuencia:** el espacio le parece algo lejano y aburrido, y no se imagina estudiando ciencia.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| NASA Image and Video Library | Fotos reales de cada objeto | `https://images-api.nasa.gov/search?q=Apollo%2015%20rover&media_type=image` (sin clave) |
| NSSDCA Master Catalog | Ficha técnica de cada misión (fechas, masa, estado) | https://nssdc.gsfc.nasa.gov/nmc/ |
| Moon Trek / Mars Trek | Ubicación del objeto en un mapa real | https://trek.nasa.gov/moon/ · https://trek.nasa.gov/mars/ |
| Páginas de misión en science.nasa.gov | Qué descubrió cada objeto | Cita la URL en cada tarjeta |

Curar 8–12 objetos a mano en un JSON con fuente es más que suficiente. **Cada dato debe tener su link.**

## Las 4 pantallas

1. **Entrada:** el niño elige destino (Luna, Marte, espacio profundo) en un mapa o carrusel.
2. **Procesamiento:** mapa/línea de tiempo con los objetos reales en su ubicación y año. Etiqueta "Fuente: NASA".
3. **Resultado:** la historia del objeto: qué era, qué descubrió, dónde está hoy. Foto real.
4. **Acción:** mini-quiz o "insignia de explorador" que se puede compartir.

## Según tu equipo

- **Cadete (niño):** "un museo espacial donde tocas un cohete y te cuenta su historia".
- **Nivel 2 (Stitch):** 4 pantallas móviles con tema `cadete` y fotos reales.
- **Nivel 3 (Lovable/v0):** JSON curado + imágenes de images-api.nasa.gov + quiz.
- **Dev:** asistente de preguntas que responda **solo** con el corpus curado (RAG pequeño) y cite la fuente.

## Semilla para el prompt

```
Reto: Abandoned but not Forgotten (NASA Space Apps 2026).
Usuario: [estudiante de X grado en Honduras].
Objetos: [lista de 8 objetos, ej. Apollo 15 Lunar Roving Vehicle, Spirit, Ingenuity, Voyager 1].
Datos: fotos de NASA Image and Video Library (images-api.nasa.gov) y fichas de NSSDCA.
Momento de valor: el niño toca un objeto en el mapa y escucha/lee su historia.
```

## Trampas comunes

- Datos inventados por la IA: cada tarjeta necesita su fuente.
- Pasar horas en 3D: una buena historia vence a un modelo 3D.
- Lunokhod u otros objetos que no son de NASA: puedes incluirlos, pero di de qué agencia son.
