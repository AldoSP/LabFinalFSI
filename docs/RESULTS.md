# Informe de implementación y validación

## Estado actual

La aplicación está implementada como un monorepo con Next.js y Express/TypeScript. El repositorio Git tiene el commit inicial (`092282f`) vinculado al remoto `https://github.com/AldoSP/LabFinalFSI`, y las credenciales locales de MongoDB Atlas y PayPal Sandbox ya están configuradas en `server/.env` y `web/.env.local` (excluidos de Git).

## Cobertura de la guía

- Arquitectura frontend/backend separada.
- MongoDB Atlas mediante Mongoose y configuración por entorno.
- Autenticación con roles cliente/administrador.
- Catálogo, carrito, stock, checkout, pedidos y envío/entrega digital.
- PayPal Sandbox con creación y captura backend.
- Panel administrativo y Socket.IO autenticado.
- Railway preparado mediante scripts `build`/`start`, enlace en `0.0.0.0`, `trust proxy` y normalización de URLs.
- 9 pruebas ejecutables para salud, 404, autenticación, roles, validación, propiedad, precio autoritativo, idempotencia y estados.
- Contrato de API, auditoría local, plan TestSprite y plantilla de reflexión individual.
- Catálogo sin datos ficticios comprables cuando backend falla y reintento de pago después de cancelación.
- Expiración de reservas de stock a los 15 minutos al reanudar checkout/captura.

## Despliegue en Railway (pendiente de completar URLs)

- **Frontend (Next.js):** _Pendiente de pegar URL pública HTTPS de Railway_
- **Backend (Express + Socket.IO):** _Pendiente de pegar URL pública HTTPS de Railway_
- **Health check:** _`<BACKEND_URL>/health`_

## Resultados de pruebas TestSprite (pendiente de ejecución)

- **Fecha de ejecución:** _Pendiente_
- **Suite / tipo:** Live Web App (Frontend UI)
- **Casos totales / aprobados / fallidos:** _Pendiente_
- **Defectos encontrados y corregidos:** _Pendiente_
- **Decisión de liberación:** _Pendiente_

## Pendiente por acción manual del estudiante

- Hacer `git push` de los últimos ajustes al repositorio remoto.
- Crear y desplegar los servicios `server` y `web` en Railway y configurar sus variables de entorno.
- Verificar `/health`, MongoDB Atlas Network Access, pago PayPal Sandbox y Socket.IO (WSS) en producción.
- Ejecutar la suite de TestSprite contra la URL desplegada y registrar la evidencia real en esta sección y en `docs/TESTSPRITE_PLAN.md`.
- Completar la reflexión individual en `docs/REFLECTION.md`.

## Limitaciones conocidas

- Las portadas son URLs externas de demostración.
- No se almacenan archivos digitales ni se habilitan descargas reales.
- La entrega es digital simulada; no existe integración con transportista.
- El frontend requiere `NEXT_PUBLIC_PAYPAL_CLIENT_ID` para mostrar los botones Sandbox.
- Las cuentas, credenciales, infraestructura y aprobación/cancelación reales no pueden generarse sin acceso externo del estudiante.

## Decisiones humanas

- Se tomó el requisito final de tienda de ebooks como autoritativo frente al narrativa de restaurante PlatoYa.
- Se eligió entrega digital como interpretación de envíos.
- Se mantuvo React/Next.js y Express/TypeScript con separación de responsabilidades.
