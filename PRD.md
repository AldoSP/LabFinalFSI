# PRD: Lectora

## Propósito

Lectora es una tienda de libros electrónicos que permite descubrir títulos, comprar copias digitales con PayPal Sandbox, consultar pedidos y administrar catálogo, stock y entregas.

## Actores

- **Visitante:** explora catálogo y detalle.
- **Cliente:** se registra, inicia sesión, compra, paga y consulta pedidos propios.
- **Administrador:** mantiene libros y stock, revisa pedidos y autoriza transiciones de entrega.

## Modelo de entrega

Los productos se entregan digitalmente. Se registra correo, país y notas como contexto de fulfillment; no se envían paquetes físicos. El tablero utiliza estados de entrega digital.

## Requisitos funcionales

1. Catálogo público con búsqueda, categorías, disponibilidad y detalles.
2. Registro/login con roles y contraseñas cifradas mediante hash.
3. Carrito con cantidades válidas y stock conocido.
4. Checkout que envía solo identificadores y cantidades; el backend calcula el total.
5. Pedido de cliente autenticado y asociado inequívocamente al propietario.
6. Reserva/decremento de stock con verificación condicional.
7. Orden PayPal Sandbox creada por backend.
8. Captura PayPal verificada por importe, moneda, estado y orden.
9. Captura idempotente que no produce pagos ni pedidos duplicados.
10. Historial exclusivo del cliente propietario.
11. Administración de libros y stock exclusiva.
12. Tablero administrativo con transiciones válidas y tiempo real.
13. Actualización del cliente mediante Socket.IO y recuperación por REST.
14. `/health`, CORS restringido, manejo seguro de errores y logs sin secretos.

## Criterios de aceptación

- Un cliente anónimo puede consultar catálogo, pero no pedidos ni administración.
- Un cliente no puede consultar, capturar ni modificar un pedido ajeno.
- Cambiar el total en herramientas de navegador no cambia el pago capturado.
- Una captura repetida devuelve el resultado conocido o rechaza duplicados.
- Stock no puede ser negativo y pedidos simultáneos no deben superar el inventario disponible.
- Un cocinero/restaurante no existe en la interfaz final: el dominio es ebooks.
- Frontend y backend despliegan por HTTPS en Railway y responden correctamente.
- TestSprite cubre autenticación, catálogo, carrito, autorización, pago, estados y navegación desplegada.

## Fuera de alcance

- Pagos reales o Live.
- Almacenamiento o descarga real de archivos EPUB/PDF/MOBI.
- Facturación fiscal, impuestos multi-país, cupones y devoluciones.
