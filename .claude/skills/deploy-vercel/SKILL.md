---
name: deploy-vercel
description: Publica el prototipo de Space Apps con un link público que el jurado pueda abrir, sea cual sea la herramienta (Lovable, v0, Google Stitch, o Next.js hecho con Claude Code o Codex), y lo deja listo para el demo (variables de entorno, respaldo, QR, plan B). Úsala cuando el equipo quiera desplegar, publicar, compartir un link con el jurado, configurar claves de API (FIRMS, api.nasa.gov) o arreglar un deploy que falla.
---

# Publicar el prototipo

Un link que el jurado puede abrir vale más que diez diapositivas. **Publica temprano** (en cuanto existan las 4 pantallas con datos falsos) y vuelve a publicar seguido.

## 1. Elige el camino según la herramienta

| Herramienta | Cómo publicar | Link para el jurado |
|---|---|---|
| **Lovable** | Botón **Publish**. | `https://<proyecto>.lovable.app` |
| **v0** | Botón **Deploy** o **Publish**: crea un proyecto en Vercel. | El dominio del proyecto, `https://<proyecto>.vercel.app` |
| **Google Stitch** | Exporta a Figma, conecta las pantallas como prototipo y comparte con "cualquiera con el link puede ver". Si exportaste código, publícalo con v0 o con el CLI (abajo). | Link del prototipo de Figma |
| **Claude Code / Codex** (Next.js en `app/`) | Vercel CLI o importar el repo de GitHub en Vercel. La mecánica del CLI está en la skill `deploy-to-vercel`; abajo, lo propio de Space Apps. | `https://<proyecto>.vercel.app` |

## 2. Claude Code / Codex: lo específico de este kit

Sigue `deploy-to-vercel` para detectar el estado (git remote, `.vercel/`, `vercel whoami`) y elegir el método. Ajustes para este repo:

- **La app vive en `app/`.** Despliega esa carpeta: `vercel deploy app -y --no-wait`, o en el dashboard pon **Root Directory = `app`**. Desde la raíz del kit, Vercel no encontrará el proyecto de Next.
- **Antes del primer deploy corre `npm run build` dentro de `app/`.** El error que veas es el mismo que verá Vercel, pero localmente tarda menos en resolverse.
- **Sin cuenta de Vercel o sin poder iniciar sesión:** `npx vercel@latest deploy app --temporary -y`. Devuelve un link temporal y un link para reclamarlo. **Reclámalo antes del pitch** o expirará; no compartas el link de reclamo.
- **Preview vs. producción:** `deploy-to-vercel` publica preview por defecto. Las URLs de preview (con un hash en el nombre) suelen estar protegidas con login de Vercel, así que **el jurado no podría abrirlas**. Para el link final usa producción (`vercel deploy app --prod`, o push a `main` si está conectado a git) y comparte el dominio del proyecto, no la URL con hash. Pide confirmación al equipo antes de publicar a producción o hacer push.

## 3. Variables de entorno

| Variable | Para qué | ¿Pública? |
|---|---|---|
| `NASA_API_KEY` | api.nasa.gov (`DEMO_KEY` se agota rápido; pide una gratis) | No |
| `FIRMS_MAP_KEY` | API de incendios FIRMS | No |
| `NEXT_PUBLIC_APP_NAME` | Nombre visible en la UI | Sí |

- Solo las variables con prefijo `NEXT_PUBLIC_` llegan al navegador. **Las claves nunca llevan ese prefijo** y se usan desde route handlers.
- En Vercel: **Settings → Environment Variables**, o `vercel env add NASA_API_KEY production`. **Vuelve a desplegar** después de agregarlas: no se aplican a deploys anteriores.
- En local: `app/.env.local` (ignorado por git).
- En Lovable: usa su gestión de secretos y llama a la API desde una función del servidor, nunca desde el código del navegador.

## 4. Antes de dar el link (checklist del demo)

- [ ] Abre el link en **ventana de incógnito**: si pide login, no es el link correcto.
- [ ] Ábrelo en un **celular con datos móviles** (no con el wifi del evento).
- [ ] Recorre las 4 pantallas con el botón "Ver ejemplo".
- [ ] Apaga la API (o simula el fallo) y comprueba que aparecen los **datos de respaldo** con su etiqueta.
- [ ] La pantalla 2 muestra "Fuente: …, NASA" y la fecha.
- [ ] Pon el link y un **código QR** en la última diapositiva y en la entrega de Space Apps.
- [ ] **Plan B:** una pestaña con el demo ya cargado y un video de 60 segundos del recorrido.

## 5. Si falla

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `Module not found` en Vercel pero funciona local | Mayúsculas en imports (Windows y macOS no distinguen, Linux sí) | Corrige el nombre exacto del archivo en el import. |
| Errores de TypeScript o ESLint en el build | Vercel corre el build completo | Corrígelos. En emergencia, revisa `next.config` antes de desactivar validaciones y dilo como deuda. |
| La app carga pero sin datos | Falta la variable de entorno o no se redeployó | Agrégala y vuelve a desplegar; revisa `/api/nasa` en el navegador. |
| `429` / `OVER_RATE_LIMIT` | `DEMO_KEY` agotada | Usa tu propia clave y cachea con `revalidate`. |
| Error de CORS | La API se llama desde el navegador | Muévela a un route handler. |
| El link pide iniciar sesión | Es una URL de preview protegida | Comparte el dominio de producción. |
| Build lento o con timeout | Datos grandes procesados en el build | Precalcula y sirve JSON desde `public/data/`. |

Para Lovable y v0: copia el error exacto en el chat de la herramienta y pide "corrígelo sin cambiar el diseño".
