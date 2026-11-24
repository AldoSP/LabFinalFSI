# Informe de implementación y validación

## Estado actual

La aplicación está implementada como un monorepo con Next.js y Express/TypeScript, desplegada en Railway (frontend y backend) y conectada a MongoDB Atlas y PayPal Sandbox.

## Cobertura de la guía

- Arquitectura frontend/backend separada.
- MongoDB Atlas mediante Mongoose y configuración por entorno.
- Autenticación con roles cliente/administrador.
- Catálogo, carrito, stock, checkout, pedidos y envío/entrega digital.
- PayPal Sandbox con creación y captura backend.
- Panel administrativo y Socket.IO autenticado.
- Railway desplegado mediante scripts `build`/`start`, enlace en `0.0.0.0`, `trust proxy` y normalización de URLs.
- 10 pruebas ejecutables en `server` para salud, 404, autenticación, roles, validación, propiedad, precio autoritativo, idempotencia, captura PayPal v2 y estados.
- Contrato de API, auditoría local, plan TestSprite y plantilla de reflexión individual.
- Catálogo sin datos ficticios comprables cuando backend falla y reintento de pago después de cancelación o fallo.
- Expiración de reservas de stock a los 15 minutos al reanudar checkout/captura.

## Despliegue en Railway

- **Frontend (Next.js):** `https://ebook-store-web-production.up.railway.app`
- **Backend (Express + Socket.IO):** `https://ebook-store-server-production.up.railway.app`
- **Health check:** `https://ebook-store-server-production.up.railway.app/health` (`200 OK`, `{"status":"ok"}`)

## Defectos encontrados y corregidos durante pruebas y despliegue

1. **Validación de `CLIENT_ORIGIN` y CORS en Railway:** Se normalizaron las barras finales en `CLIENT_ORIGIN` y `NEXT_PUBLIC_API_URL`, se añadió `trust proxy` para `express-rate-limit` detrás del proxy de Railway y se ajustó `CLIENT_ORIGIN` al dominio HTTPS exacto del frontend.
2. **Validación de checkout y límite de 10 unidades por título:** El frontend ocultaba el detalle de errores Zod (`issues`) y permitía superar el máximo de 10 unidades en el carrito guardado en `localStorage`. Se expusieron los errores por campo en `web/src/lib/api.ts`, se aclaró el mensaje en español en `server/src/routes/orders.ts` y se normalizó el carrito en `StoreProvider.tsx` / `CartDrawer.tsx`.
3. **Verificación de monto en captura PayPal Orders v2:** La respuesta de `/v2/checkout/orders/:id/capture` devuelve el monto en `purchase_units[0].payments.captures[0].amount` y no necesariamente en `purchase_units[0].amount`, lo que provocaba rechazos `422` después de capturar el pago en Sandbox. Se corrigió en `server/src/routes/payments.ts` (limpiando también `providerOrderId` ante fallos para permitir reintentos) y se añadió prueba de regresión en `server/src/api.security.test.ts`.

## Resultados de pruebas TestSprite

- **Fecha de ejecución:** 2026-11-24
- **Suite / tipo:** Live Web App (Frontend UI) sobre `https://ebook-store-web-production.up.railway.app/#catalogo`
- **Alcance ejecutado:** Fase exploratoria inicial ejecutada por el agente de TestSprite; los créditos de la cuenta se agotaron antes de correr la suite completa (`Run All`).
- **Hallazgos observados en la ejecución exploratoria:**
  - Validación HTML de campo obligatorio `country` en el checkout verificada.
  - Redirección del flujo de pago hacia la pantalla de inicio de sesión de PayPal Sandbox verificada (la finalización automática quedó limitada por requerir credenciales de cuenta Sandbox comprador).
  - Filtro de categoría `Ficción` verificado; la herramienta de clics del navegador de TestSprite presentó fallos de puntero al intentar seleccionar `Tecnología`/`Diseño`/`Ensayo` y en la exploración de checkout como invitado.
- **Pruebas automatizadas locales complementarias:** `npm run test` — **10/10 aprobadas** (`server`), más build de producción de `web` sin errores y verificación manual del flujo completo en el entorno desplegado.
- **Decisión de liberación:** Aprobada para entrega de laboratorio con las limitaciones documentadas (sin créditos adicionales en TestSprite para completar la batería completa).

## Pendiente por acción manual del estudiante

- Completar la reflexión individual en `docs/REFLECTION.md`.
- Adjuntar las capturas de pantalla tomadas (Railway, PayPal Sandbox, `/orders`, `/admin` y ejecución exploratoria de TestSprite) en el entregable final si el curso lo solicita por separado.
- Confirmar y subir (`git push`) la actualización final de documentación.

## Limitaciones conocidas

- Las portadas son URLs externas de demostración.
- No se almacenan archivos digitales ni se habilitan descargas reales.
- La entrega es digital simulada; no existe integración con transportista.
- El frontend requiere `NEXT_PUBLIC_PAYPAL_CLIENT_ID` para mostrar los botones Sandbox.
- Las cuentas, credenciales, infraestructura y aprobación/cancelación reales no pueden generarse sin acceso externo del estudiante.

## Decisiones humanas

- Se eligió entrega digital como interpretación de envíos.
- Se mantuvo React/Next.js y Express/TypeScript con separación de responsabilidades.
