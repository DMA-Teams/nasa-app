# 5 · Create Health Monitoring Software for Astronauts on Space Missions

**Nivel:** Intermedio · **Temas:** Exploración humana, Software
**Tema visual:** `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/

## Qué pide NASA

Una herramienta visual con la que el astronauta evalúe su propia salud durante la misión y reciba orientación. Puede recoger indicadores por texto, clics o cámara (glucosa en mg/dL, imágenes de ultrasonido...). Debe basarse en los riesgos del Human Research Program: radiación, aislamiento, gravedad alterada, ambiente cerrado y distancia de la Tierra.

## Bájalo a una persona

- **Persona:** astronauta en el día 120 de una misión de 6 meses, a 20 minutos-luz de la Tierra en una misión a Marte.
- **Situación:** siente fatiga y dolor lumbar; el médico de vuelo tarda 40 minutos en contestar.
- **Dificultad:** debe decidir solo si es normal, si debe hacer un examen o si debe alertar.
- **Consecuencia:** un problema (pérdida ósea, problema cardiovascular o de ánimo) se detecta tarde.

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| HRP: 5 riesgos del vuelo espacial | Qué indicadores vigilar y por qué | https://www.nasa.gov/hrp/hazards/ |
| HRP: riesgos detallados | Umbrales y efectos documentados | https://www.nasa.gov/hrp/risks/ |
| OSDR | Datos de estudios biológicos en vuelo | https://osdr.nasa.gov/bio/repo/ |
| CSA: radiación y salud | Dosis de radiación de referencia | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp |

Aquí no hay una API de datos personales: los datos del astronauta son **simulados** (dilo en pantalla). La parte de NASA son los riesgos, los rangos de referencia y la lógica de decisión basada en HRP.

## Las 4 pantallas

1. **Entrada:** chequeo diario de 60 segundos: sueño, ánimo, ritmo cardiaco, dolor, dosis acumulada.
2. **Procesamiento:** tendencias por sistema (huesos, corazón, mente, radiación) con el riesgo HRP que vigila cada uno.
3. **Resultado:** semáforo por sistema + "qué significa" en lenguaje claro.
4. **Acción:** protocolo sugerido (ejercicio, examen con ultrasonido, informar a la Tierra) y un mensaje listo para el médico.

## Según tu equipo

- **Nivel 2 (Stitch):** tablero tipo reloj inteligente con tema `orbita`.
- **Nivel 3 (Lovable/v0):** formulario + gráficas + reglas por umbral en un JSON con fuente HRP.
- **Dev:** detección de anomalías sobre la serie personal (z-score respecto a la propia línea base), explicaciones con cita del riesgo HRP.

## Semilla para el prompt

```
Reto: Health Monitoring Software for Astronauts (NASA Space Apps 2026).
Usuario: astronauta en misión de larga duración, con retraso de comunicación con la Tierra.
Indicadores: [sueño, ánimo, frecuencia cardiaca, dolor óseo, dosis de radiación] (simulados).
Base científica: los 5 riesgos del Human Research Program de NASA.
Momento de valor: el astronauta ve que un indicador se salió de SU línea base y recibe qué hacer.
```

## Trampas comunes

- Prometer diagnósticos médicos: es apoyo a la decisión, no diagnóstico. Dilo.
- Pedir 30 datos al día: un chequeo de un minuto es más creíble.
