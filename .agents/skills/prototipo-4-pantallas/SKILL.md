---
name: prototipo-4-pantallas
description: Construye el prototipo de Space Apps como un happy path de 4 pantallas (Entrada, Datos NASA + procesamiento, Resultado, Acción) en Next.js + Tailwind. Úsala cuando el equipo quiera empezar la app, definir pantallas, decidir qué es real y qué simulado, o recortar alcance para llegar al demo.
---

# Prototipo en 4 pantallas

Regla de oro: **construye solo el happy path**. Nada de login, roles, pagos ni manejo de errores raros.
Si alguien pregunta "¿y si el usuario escribe mal?", la respuesta es: "En nuestro demo el usuario siempre escribe bien".

## Antes de escribir código, llena esto (5 minutos)

```
Usuario concreto:      [quién, dónde]            ej. productor de arroz del Valle de Sula
Dolor:                 [qué le pasa]             ej. se entera tarde de las crecidas del Ulúa
Dato NASA motor:       [dataset + variable]      ej. NASA POWER · PRECTOTCORR (lluvia diaria)
Momento de valor:      [instante del "wow"]      ej. ve el riesgo de SU finca en un mapa
Real vs simulado:      [lista]                   ej. real: datos POWER; simulado: envío de WhatsApp
```

Si el equipo no puede llenar esto, no está listo para programar. Vuelve al problema.

## Las 4 pantallas

| # | Pantalla | Qué debe verse | Ruta sugerida |
|---|---|---|---|
| 1 | **Entrada** | Un solo formulario o mapa para que el usuario ponga su dato (ubicación, cultivo, fecha). | `/` |
| 2 | **Procesamiento** | Los datos NASA en acción: gráfica, mapa o tabla + nombre del dataset. Aquí se gana *Relevancia*. | `/analisis` |
| 3 | **Resultado** | La respuesta clara y grande: un nivel, un número, una recomendación. | `/resultado` |
| 4 | **Acción** | Qué hace el usuario ahora: botón de alerta, compartir, plan. Puede ser simulado. | `/accion` |

## Stack recomendado

- **Next.js (App Router) + TypeScript + Tailwind**: se despliega en Vercel sin configuración.
- **Recharts** para gráficas, **react-leaflet** para mapas (con capa GIBS, ver skill `nasa-data`).
- Datos NASA en un **route handler** `app/api/nasa/route.ts` con cache y fallback a `public/fallback/*.json`.
- IA opcional: si usas un LLM para explicar el resultado, ponlo en la pantalla 3 y deja claro qué datos recibe.
- **Estilo:** aplica un tema de `design-tokens/build/` (skill `tokens-diseno`) desde el primer commit. No inventes colores.
- **Pulido de UI:** cuando el flujo ya funcione, usa las skills de UI según `docs/ui-skills.md` (implementación y accesibilidad con `frontend-ui-engineering`, revisión con `web-design-guidelines`, movimiento con `emil-design-eng`).

## Orden de trabajo (para 24–48 h)

1. Pantallas 1→4 con **datos falsos** navegables (1–2 h). Ya tienen algo que mostrar.
2. Conectar **un** dataset NASA real a la pantalla 2.
3. Calcular el resultado de la pantalla 3 con ese dato (regla simple > modelo complejo).
4. **Deploy en Vercel** (skill `deploy-vercel`). Link público desde temprano.
5. Botón "Ver ejemplo" en la pantalla 1 que precargue el caso del pitch: el demo en vivo no depende de escribir bien bajo presión.
6. Pulir textos, colores y el guion del demo. Parar de agregar funciones 6 h antes de entregar.

## Checklist antes de dar por terminado

- [ ] Se puede recorrer de la pantalla 1 a la 4 sin tocar código.
- [ ] La pantalla 2 muestra el nombre del dataset NASA y la fecha de los datos.
- [ ] Hay un JSON de respaldo si la API falla.
- [ ] Lo simulado está marcado como "simulado".
- [ ] Funciona en el celular (el jurado puede abrirlo ahí).
- [ ] El link de Vercel abre en una ventana de incógnito.
