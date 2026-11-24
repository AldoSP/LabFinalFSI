# Auditoría local de seguridad

## Alcance

Revisión estática de autenticación, autorización, confianza en precios, PayPal, stock, WebSockets, CORS, validación y manejo de errores. No sustituye una prueba con MongoDB/PayPal/Railway desplegados.

## Controles verificados

- Contraseñas se guardan con bcrypt y no se exponen en respuestas.
- El rol público de registro se fuerza a `customer` en el servidor.
- Operaciones administrativas requieren JWT con rol `admin`.
- Pedidos y captura requieren coincidencia `userId`/JWT.
- Precios, totales y stock se reconstruyen desde MongoDB.
- El estado de pago pasa a capturado solo después de respuesta PayPal `COMPLETED`, importe y moneda correctos.
- Capturas repetidas devuelven la captura ya conocida.
- Stock se reserva condicionalmente y se libera en cancelación, fallo o expiración de 15 minutos.
- Salas Socket.IO derivan de identidad validada y no de datos del navegador.
- CORS permite el origen configurado, no cualquier origen.
- Zod limita datos y Express controla errores sin revelar secretos.
- Se excluyen `.env`, `node_modules`, `.next` y `dist` mediante `.gitignore`.

## Hallazgos y riesgos residuales

### Alto: infraestructura no probada

No puede confirmarse el flujo real Atlas/PayPal/Railway/WSS hasta contar con credenciales externas y despliegues. Reproducción: configurar servicios y ejecutar pago Sandbox completo.

### Medio: reserva de stock no transaccional ante caída de proceso

La reserva revierte los artículos ya modificados cuando una actualización falla, pero una caída abrupta puede dejar una reserva hasta que una petición posterior detecte expiración. Recomendación futura: usar transacción MongoDB o reserva única/versionada.

### Medio: idempotencia de creación PayPal

El pedido reutiliza un `providerOrderId` existente, pero dos solicitudes simultáneas iniciales pueden competir antes de persistirlo. Recomendación: guardar clave idempotente/lock con actualización condicional o transacción.

### Medio: JWT en localStorage

Es fácil de usar en laboratorio, pero una XSS podría leerlo. La aplicación valida contenido y no usa `dangerouslySetInnerHTML`; para producción sería preferible cookie HttpOnly con protección CSRF.

### Medio: expiración dependiente de actividad

La reserva expira al reintentar crear/capturar la orden. No existe job de limpieza en segundo plano. A corto plazo, comprobar reintento; a futuro usar worker/TTL.

## Evidencia automatizada disponible

- 9 pruebas ejecutables cubren salud, 404, autenticación, roles, cantidades, propiedad, precio autoritativo, idempotencia y estados.
- Build completo de frontend y backend sin errores.

## Requisitos previos para cerrar auditoría

Ejecutar TestSprite y las pruebas manuales desplegadas, revisar logs Railway, probar desconexión/reconexión WSS y rotar cualquier secreto usado en pruebas si llega a filtrarse.
