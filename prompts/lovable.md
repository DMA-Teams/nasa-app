# Lovable (Nivel 3: app funcional con link público)

Lovable genera una app web completa (React + Tailwind) desde un chat y la publica con un link. Ideal para equipos mixtos.

## Antes de empezar

- Crea el proyecto y, si tu plan lo permite, pega en el **conocimiento del proyecto** (instrucciones persistentes) el bloque de tu tema y estas reglas:

```
Reglas del proyecto (NASA Space Apps 2026):
- Interfaz en español. Primero celular.
- Exactamente 4 páginas: Entrada, Datos NASA, Resultado, Acción. Solo el camino feliz.
- Sin login, registro, pagos ni base de datos de usuarios. No conectar autenticación.
- La página de Datos NASA siempre muestra "Fuente: <dataset>, NASA" y la fecha de los datos.
- Lo simulado se marca "(simulado)".
- Si la API falla, usa los datos de respaldo de /public/fallback y muestra "datos de respaldo".
- No usar el logo de NASA.
```

- Si tu herramienta tiene un modo de **solo chat o planificación**, úsalo primero para revisar el plan. Gasta menos créditos que generar y corregir.

## Prompt inicial

```
Construye una app web para el NASA Space Apps Challenge 2026, reto "[nombre del reto]".

Propuesta de valor: "Ayudamos a [usuario] a [resultado] sin [dolor]".
Usuario: [persona concreta y lugar]. Problema: [qué le pasa y qué consecuencia tiene].

Datos NASA (el motor de la app):
- API: [URL exacta del endpoint, ej. NASA POWER con sus parámetros].
- Variables: [ej. PRECTOTCORR = lluvia mm/día]. Ignora los valores -999 (sin dato).
- Si la API falla, usa estos datos de respaldo realistas: [pega 5–10 filas reales o pide que los genere a partir de la forma del JSON].

Páginas (solo el camino feliz, sin login):
1. "/" Entrada: [qué ingresa el usuario]. Botón "[texto]" lleva a /datos.
2. "/datos" Datos NASA: [gráfica/mapa] de [variable] con "Fuente: [dataset], NASA · [fecha]".
3. "/resultado" Resultado: [indicador grande + explicación de 2 líneas]. Regla de cálculo: [regla simple].
4. "/accion" Acción: [botón principal (simulado)] y resumen.
Una barra superior con el nombre de la app y "Paso X de 4".

[PEGA AQUÍ EL BLOQUE DEL TEMA VISUAL]
```

## Prompts de iteración (uno a la vez)

1. **Datos reales:** `Conecta la página /datos a la API real [URL]. Muestra un indicador de carga y, si falla, los datos de respaldo con la etiqueta "datos de respaldo".`
2. **Pantalla 2 clara:** `En /datos, agrega debajo de la gráfica una línea: "Qué estás viendo: [explicación en 1 frase]".`
3. **Celular:** `Revisa todas las páginas en 375 px de ancho: nada debe desbordarse y los botones deben medir al menos 44 px de alto.`
4. **Accesibilidad:** `Asegura contraste AA, foco visible al navegar con teclado y textos alternativos en imágenes y gráficas.`
5. **Pulido para el demo:** `Agrega en la página de inicio un botón "Ver ejemplo" que llene el formulario con [datos del caso del pitch] para hacer el demo en 1 clic.`

El prompt 5 es el truco más valioso: el demo en vivo no depende de que escribas bien bajo presión.

## Publicar

1. Publica desde Lovable y abre el link en incógnito y en tu celular.
2. Conecta el proyecto a GitHub si alguien del equipo quiere seguir en v0, Claude Code o Codex.
3. Para dominio propio o variables de entorno con claves de API, sigue la skill `deploy-vercel` (`.agents/skills/deploy-vercel/SKILL.md`).

## Si algo sale mal

- Entra en un ciclo de errores: `Revierte al último estado que funcionaba` (usa el historial) y pide el cambio en partes más pequeñas.
- Agregó login o base de datos sin pedirlo: `Elimina la autenticación y cualquier tabla de usuarios; la app es pública y sin cuentas.`
- La API da error de CORS: pide que la llamada se haga desde una función del servidor (edge function) en vez del navegador, o usa los datos de respaldo para el demo.
