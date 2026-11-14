# 4 · Lunar Landing Site Navigator (CLPS Lunar Mission Browser)

**Nivel:** Avanzado · Intermedio · **Temas:** Exploración humana, Luna, Software
**Tema visual:** `marte` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/

## Qué pide NASA

Una herramienta intuitiva para que planificadores, educadores y público comparen **sitios y fechas de alunizaje**, sobre todo cerca del polo sur lunar, visualizando la posición del **Sol y la Tierra respecto al horizonte local** para evaluar potencial de energía solar y ventanas de comunicación directa con la Tierra.

## Bájalo a una persona

- **Persona:** profesora de Física de bachillerato en SPS que prepara una clase sobre Artemis.
- **Situación:** quiere explicar por qué es tan difícil alunizar en el polo sur.
- **Dificultad:** las herramientas existentes (Horizons, Quickmap) son poderosas pero intimidantes.
- **Consecuencia:** la clase se queda en videos y no entiende el problema real de luz y comunicación.

(También funciona con un planificador de misión como persona; elige uno.)

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| JPL Horizons API | Elevación y azimut del Sol y la Tierra vistos desde una coordenada lunar en una fecha | `https://ssd.jpl.nasa.gov/api/horizons.api` (observador en la Luna: `CENTER='coord@301'`) |
| Moon Trek | Mapas, elevación e imágenes del sitio | https://trek.nasa.gov/moon/ |
| LROC Quickmap | Capas de iluminación y pendiente del polo sur | https://quickmap.lroc.asu.edu/ |

Precalcula las series Sol/Tierra para 5–8 sitios y un mes, y guárdalas en JSON.

## Las 4 pantallas

1. **Entrada:** elige sitios (Apollo, objetivos CLPS, Shackleton) o escribe coordenadas, y una fecha.
2. **Procesamiento:** diagrama de horizonte con el Sol y la Tierra moviéndose en el tiempo + "Fuente: JPL Horizons".
3. **Resultado:** tabla comparativa: horas de sol, horas con la Tierra visible y mejor ventana.
4. **Acción:** exportar la comparación o "programar alunizaje" en la mejor ventana.

## Según tu equipo

- **Nivel 3 (v0):** gráficas polares con datos precalculados.
- **Dev:** proxy a Horizons en el servidor (con cache), horizonte local con el relieve de LOLA como extra y modo comparación lado a lado.

## Semilla para el prompt

```
Reto: Lunar Landing Site Navigator (NASA Space Apps 2026).
Usuario: [profesora / planificador de misión].
Sitios: [Shackleton rim, Apollo 17, sitio CLPS X, coordenada personalizada].
Datos: elevación/azimut del Sol y la Tierra desde JPL Horizons, precalculados por hora durante [mes].
Momento de valor: ver en un diagrama de horizonte cuándo hay sol Y Tierra visibles a la vez.
```

## Trampas comunes

- Horizons tiene muchos parámetros: haz primero una consulta a mano y guárdala.
- No ignores el relieve: en el polo, una montaña tapa el Sol aunque esté "sobre el horizonte". Dilo como límite si no lo modelas.
