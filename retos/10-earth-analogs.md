# 10 · Identify Earth Locations that Analog the Permanent Moon Base Locations and Mars

**Nivel:** Avanzado · Intermedio · Principiante/Juvenil · **Temas:** Ciencias de la Tierra, Planetas y Lunas, Software, Exploración
**Tema visual:** `marte` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/ (búscalo por nombre)

## Qué pide NASA

Usar datos abiertos de la Tierra, la Luna y Marte (de NASA y otras agencias) para **identificar y caracterizar nuevos sitios análogos en la Tierra**: desiertos, zonas polares, terreno volcánico o árido, cuevas y otros ambientes parecidos a la Luna o a Marte. Ejemplos conocidos: Atacama, cráter Haughton, Valle de la Muerte.

## Bájalo a una persona

- **Persona:** científico de una misión que necesita probar un rover antes de enviarlo.
- **Situación:** los análogos famosos están saturados, son caros o están lejos.
- **Dificultad:** no hay un catálogo comparable de qué tanto se parece cada lugar a un sitio lunar o marciano específico.
- **Consecuencia:** se prueban equipos en lugares que no representan bien su destino.

Gancho local para el pitch: ¿hay análogos en Centroamérica (campos volcánicos, cuevas como Talgua) que nadie ha caracterizado?

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| SRTM / ASTER GDEM | Relieve y pendiente en la Tierra | https://www.earthdata.nasa.gov/data/instruments/srtm |
| MODIS (temperatura de superficie, NDVI) | Aridez y falta de vegetación | AppEEARS: https://appeears.earthdatacloud.nasa.gov/ |
| NASA POWER | Lluvia y temperatura por punto (aridez) | https://power.larc.nasa.gov/ |
| Mars Trek / Moon Trek | Relieve (MOLA, LOLA) e imágenes del sitio objetivo | https://trek.nasa.gov/mars/ · https://trek.nasa.gov/moon/ |

Método simple y defendible: define 4–6 rasgos (pendiente, rugosidad, aridez, temperatura, albedo/vegetación), normalízalos y calcula una **puntuación de similitud** entre cada candidato terrestre y el sitio objetivo.

## Las 4 pantallas

1. **Entrada:** elige el sitio objetivo (por ejemplo, cráter Jezero o el polo sur lunar).
2. **Procesamiento:** mapa mundial de candidatos coloreados por similitud + rasgos usados y sus fuentes.
3. **Resultado:** ficha del mejor análogo: "se parece 82 % en relieve y aridez", con fotos comparadas.
4. **Acción:** guardar o compartir la ficha y proponer una campaña de pruebas.

## Según tu equipo

- **Cadete:** "un juego de adivinar: ¿esta foto es de Marte o de la Tierra?" con imágenes reales.
- **Nivel 3 (v0):** catálogo curado de 20 sitios con rasgos precalculados.
- **Dev:** extracción de rasgos con AppEEARS y rasterio, similitud coseno o clustering, validación con Atacama/Haughton como control.

## Semilla para el prompt

```
Reto: Earth Analogs for Moon and Mars (NASA Space Apps 2026).
Usuario: [científico de misión que prueba un rover].
Sitio objetivo: [Jezero / polo sur lunar]. Candidatos: [20 sitios terrestres].
Rasgos: pendiente (SRTM), aridez (NASA POWER), temperatura y NDVI (MODIS).
Momento de valor: descubrir un análogo nuevo con su porcentaje de similitud explicado.
```

## Trampas comunes

- Similitud "porque se ve rojo": justifica cada rasgo con datos.
- Validar sin control: muestra que Atacama sale alto en tu índice.
