# 12 · Planet X and SPHEREx

**Nivel:** Avanzado · **Temas:** Astrofísica, Planetas y Lunas, Software
**Tema visual:** `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/

## Qué pide NASA

Una herramienta web pública que muestre imágenes del cielo de la misión **SPHEREx** (cubre el cielo cada seis meses en 102 bandas infrarrojas) y haga fácil ver **cómo cambian con el tiempo**. El usuario escribe coordenadas (ascensión recta y declinación) y ve la serie de imágenes como un pequeño video para detectar objetos que se mueven. NASA pide probarla con la estrella de Barnard, Epsilon Indi B, WISE 0855 (AR 08h55m10.831s, Dec −7°14′42.53″) y las variables RW Aurigae y R Draconis.

## Bájalo a una persona

- **Persona:** integrante de un club de astronomía aficionada en Honduras.
- **Situación:** quiere participar en ciencia ciudadana (como Backyard Worlds).
- **Dificultad:** los archivos FITS y las 102 bandas son inaccesibles sin programar.
- **Consecuencia:** el público se queda fuera del descubrimiento de enanas marrones u objetos nuevos.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| IRSA: SPHEREx | Imágenes y servicios de búsqueda por coordenada | https://irsa.ipac.caltech.edu/Missions/spherex.html |
| Tutoriales SPHEREx (notebooks) | Cómo descargar recortes por coordenada | https://caltech-ipac.github.io/irsa-tutorials/spherex/ |
| WiseView | Referencia de la interfaz tipo "parpadeo" | http://byw.tools/wiseview |
| Gaia | Movimientos propios para validar | https://archive.stsci.edu/missions-and-data/gaia |

Precalcula recortes (cutouts) PNG de los 5 objetos de prueba en varias épocas y bandas; el servidor solo tiene que servir imágenes.

## Las 4 pantallas

1. **Entrada:** escribe coordenadas o elige uno de los 5 objetos de prueba.
2. **Procesamiento:** animación "parpadeo" época a época, selector de banda o combinación RGB de bandas + "Fuente: NASA SPHEREx / IRSA".
3. **Resultado:** el objeto en movimiento resaltado, con su desplazamiento estimado y el dato de Gaia de comparación.
4. **Acción:** marcar un candidato y compartirlo o exportarlo para revisión.

## Según tu equipo

- **Dev (recomendado):** Python (`astropy`, `pyvo`) para los recortes, normalización de contraste, sobreposición de movimiento propio de Gaia.
- **Nivel 3 (v0):** visor con recortes precalculados y controles de animación.

## Semilla para el prompt

```
Reto: Planet X and SPHEREx (NASA Space Apps 2026).
Usuario: [astrónomo aficionado de un club en Honduras].
Datos: recortes de SPHEREx (IRSA) de [Barnard's Star, WISE 0855, ...] en [N] épocas y bandas [X, Y, Z].
Momento de valor: ver parpadear el cielo y descubrir el punto que se mueve.
```

## Trampas comunes

- Intentar mostrar las 102 bandas a la vez: propone una forma inteligente de agruparlas (eso suma creatividad).
- Servir FITS completos al navegador: siempre usa recortes.
