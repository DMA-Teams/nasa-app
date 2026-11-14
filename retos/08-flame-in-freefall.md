# 8 · Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data

**Nivel:** Avanzado · Intermedio · **Temas:** Exploración espacial
**Tema visual:** `orbita` · **Brief oficial:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

## Qué pide NASA

Un tablero web con IA que **resuma, ordene e interprete** décadas de experimentos de combustión en microgravedad (muchos en la Estación Espacial) para dar ideas de seguridad contra incendios en naves, estaciones, bases lunares y marcianas, y rovers presurizados. Los datos están en el repositorio PSI de NASA y son difíciles de encontrar, comparar y entender.

## Bájalo a una persona

- **Persona:** ingeniera de seguridad que diseña el hábitat de una base lunar.
- **Situación:** debe elegir materiales y ventilación para el módulo de cocina.
- **Dificultad:** hay cientos de experimentos, con nombres crípticos y PDFs largos.
- **Consecuencia:** se ignora evidencia clave y aumenta el riesgo de incendio (recuerda Apollo 1 y el incendio de la Mir en 1997).

## Datos NASA (motor)

| Fuente | Para qué | Acceso |
|---|---|---|
| PSI Data Repository: Combustion Science | Corpus de experimentos (metadatos, reportes, datos) | https://psi.nasa.gov/physci/repo/search?q=combustion |
| Guía de combustión en la ISS | Contexto para clasificar experimentos | https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/ |
| Lecciones de Apollo 1 / Apollo 13 / Mir | Casos para el pitch | https://sma.nasa.gov/sma-disciplines/accllp/apollo-1 |

Arma un corpus de 20–40 experimentos con sus metadatos y el link a cada uno. La IA solo responde con ese corpus.

## Las 4 pantallas

1. **Entrada:** escenario de la misión (hábitat lunar, rover presurizado), material o pregunta.
2. **Procesamiento:** lista de experimentos relevantes, ordenados por relevancia, con chips (material, flujo de aire, presión, oxígeno) + "Fuente: NASA PSI".
3. **Resultado:** resumen de hallazgos con citas a cada experimento y el nivel de confianza.
4. **Acción:** checklist de seguridad exportable para el diseño del hábitat.

## Según tu equipo

- **Nivel 3 (v0):** tabla con filtros sobre un JSON curado + resumen generado con IA en el servidor.
- **Dev:** RAG con embeddings sobre las descripciones de PSI, ranking por escenario y citas obligatorias; evaluación con 10 preguntas de control.

## Semilla para el prompt

```
Reto: Flame in Freefall (NASA Space Apps 2026).
Usuario: [ingeniera de seguridad de un hábitat lunar].
Corpus: [N] experimentos de combustión del repositorio NASA PSI (título, material, condiciones, hallazgo, URL).
IA: resume y ordena SOLO con el corpus; cada afirmación cita su experimento.
Momento de valor: preguntar "¿qué material arde menos con flujo de aire bajo?" y obtener respuesta con citas.
```

## Trampas comunes

- Chatbot genérico sin citas: el jurado lo detecta en un minuto.
- Querer ingerir todo el repositorio: un corpus pequeño y bien curado gana.
