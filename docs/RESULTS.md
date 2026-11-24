# Informe de implementación y validación

## Estado actual

La aplicación está implementada como un monorepo con Next.js y Express/TypeScript. El repositorio Git está inicializado; el estudiante aún debe revisar, añadir y confirmar el commit inicial.

## Cobertura de la guía

- Arquitectura frontend/backend separada.
- MongoDB Atlas mediante Mongoose y configuración por entorno.
- Autenticación con roles cliente/administrador.
- Catálogo, carrito, stock, checkout, pedidos y envío/entrega digital.
- PayPal Sandbox con creación y captura backend.
- Panel administrativo y Socket.IO autenticado.
- Railway preparado mediante scripts `build`/`start`.
- 9 pruebas ejecutables para salud, 404, autenticación, roles, validación, propiedad, precio autoritativo, idempotencia y estados.
- Contrato de API, auditoría local, plan TestSprite y plantilla de reflexión individual.
- Catálogo sin datos ficticios comprables cuando backend falla y reintento de pago después de cancelación.
- Expiración de reservas de stock a los 15 minutos al reanudar checkout/captura.

## Pendiente de infraestructura externa

- Crear clúster/cuenta MongoDB y cargar credenciales locales/Railway.
- Crear aplicación PayPal Sandbox y cargar Client ID/Secret.
- Ejecutar seed con cuenta administradora dedicada.
- Crear servicios Railway y completar variables/dominios.
- Ejecutar TestSprite contra URLs desplegadas.
- Capturar evidencia de pruebas y resultados reales.
- Añadir y confirmar el commit inicial del repositorio Git.
- Completar la reflexión individual en `REFLECTION.md`.

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
