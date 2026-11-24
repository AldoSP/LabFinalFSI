# Contrato de API y autorización

## Autenticación

| Método | Ruta | Entrada | Acceso | Resultado |
|---|---|---|---|---|
| POST | `/api/auth/register` | `name`, `email`, `password` | Público | Crea siempre rol `customer`; 409 genérico si el correo existe. |
| POST | `/api/auth/login` | `email`, `password` | Público | Devuelve JWT de 8 horas y perfil seguro. |

## Libros

| Método | Ruta | Acceso | Regla principal |
|---|---|---|---|
| GET | `/api/books` | Público | Solo libros disponibles con stock positivo; soporta `search` y `category`. |
| GET | `/api/books/:id` | Público | Solo libro disponible y con stock. |
| GET | `/api/books/admin/all` | Admin | Incluye inventario agotado/no disponible para operación. |
| POST | `/api/books/admin` | Admin | Valida precio positivo, stock entero y formato. |
| PATCH | `/api/books/admin/:id` | Admin | Actualización parcial con validación. |
| DELETE | `/api/books/admin/:id` | Admin | Baja lógica mediante `available=false`. |

## Pedidos

| Método | Ruta | Acceso | Regla principal |
|---|---|---|---|
| POST | `/api/orders` | Cliente autenticado | Recibe IDs/cantidades, consulta precio y stock, guarda snapshot y total autoritativo. |
| GET | `/api/orders/me` | Cliente autenticado | Solo pedidos donde `userId` coincide con el JWT. |
| GET | `/api/orders/:id` | Propietario | Devuelve 404 cuando el pedido no pertenece al usuario. |
| GET | `/api/orders` | Admin | Lista pedidos para fulfillment. |
| PATCH | `/api/orders/:id/status` | Admin | Solo transición inmediatamente siguiente y pago capturado. |

## Pagos PayPal

| Método | Ruta | Acceso | Regla principal |
|---|---|---|---|
| POST | `/api/payments/paypal/order` | Propietario | Crea/recupera orden Sandbox, reserva stock y expira reservas a los 15 minutos. |
| POST | `/api/payments/paypal/capture` | Propietario | Verifica captura, monto, moneda, estado y orden; evita segunda captura. |
| POST | `/api/payments/paypal/cancel` | Propietario | Libera reserva y permite crear otra orden de pago. |

## WebSockets

- El cliente presenta JWT en `handshake.auth.token`.
- Administradores se unen al canal interno `operations`.
- Clientes se unen únicamente a `user:<userId>` derivado del JWT.
- El navegador no envía ni selecciona nombres de sala.
- Eventos: `connection:ready`, `order:created`, `order:updated`.

## Errores

- 400: validación o datos inválidos.
- 401: token ausente/inválido.
- 403: rol no autorizado.
- 404: recurso inexistente o no perteneciente al usuario.
- 409: conflicto de stock, estado o duplicidad.
- 422: no fue posible verificar la captura PayPal.
- 500: error interno seguro, sin detalles sensibles al cliente.
