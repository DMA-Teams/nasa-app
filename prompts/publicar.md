# Publicar tu prototipo (link para el jurado)

El jurado necesita **un link que abra en su celular sin pedir login**. Publica en cuanto tengas las 4 pantallas, aunque sea con datos de ejemplo, y vuelve a publicar cada vez que mejores algo.

## Según tu herramienta

### Lovable
1. Botón **Publish** (arriba a la derecha).
2. Copia el link `https://<tu-proyecto>.lovable.app`.
3. Si usas una clave de API (FIRMS, api.nasa.gov), guárdala en los secretos del proyecto y pide en el chat: `Llama a la API desde una función del servidor usando el secreto NASA_API_KEY; nunca pongas la clave en el código del navegador.`

### v0
1. Botón **Deploy** o **Publish**: se crea un proyecto en Vercel.
2. Si usas claves de API: en Vercel, abre el proyecto → **Settings → Environment Variables**, agrégalas y **vuelve a desplegar**.
3. Comparte el dominio del proyecto (`https://<tu-proyecto>.vercel.app`), no un link largo con letras y números raros: esos suelen pedir login.

### Google Stitch
1. Exporta las pantallas a **Figma**.
2. En Figma, modo **Prototype**: conecta el botón de cada pantalla con la siguiente.
3. **Share** → "Cualquiera con el link puede ver" → copia el link del prototipo.
4. ¿Quieres que sea una app real? Lleva el diseño a v0 (sube capturas de las pantallas) o pídele a un dev que lo publique.

### Claude Code o Codex
Pídele al agente: `Publica la app con la skill deploy-vercel y dame el link de producción.` Si no tienes cuenta de Vercel, puede usar un deploy temporal; reclámalo antes del pitch.

## Checklist antes del pitch

- [ ] El link abre en **ventana de incógnito** sin pedir login.
- [ ] Abre en un **celular con datos móviles**, no con el wifi del evento.
- [ ] Se pueden recorrer las 4 pantallas de principio a fin.
- [ ] Se ve "Fuente: …, NASA" en la pantalla de datos.
- [ ] El link y un **código QR** están en tu última diapositiva y en tu entrega de Space Apps.
- [ ] **Plan B listo:** una pestaña con el demo ya abierto y un video de 60 segundos grabado del recorrido.

## Si algo falla

Copia el mensaje de error **exacto** en el chat de tu herramienta y escribe:

```
El deploy falla con este error: [pega el error]. Corrígelo sin cambiar el diseño ni agregar funciones nuevas.
```
