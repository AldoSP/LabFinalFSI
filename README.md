# Lectora: laboratorio full-stack de ebooks

Implementación del laboratorio final como tienda de libros electrónicos. Usa Next.js, Express, MongoDB Atlas, PayPal Sandbox, Socket.IO, Railway y TestSprite.

## Alcance adoptado

La guía mezcla un restaurante PlatoYa con un requisito final de comercio electrónico de ebooks. Esta implementación utiliza el requisito explícito de ebooks y conserva la arquitectura y controles de seguridad del documento.

## Requisitos

- Node.js LTS
- npm
- MongoDB Atlas o MongoDB local
- PayPal Sandbox
- Railway y TestSprite para la fase de despliegue/pruebas

## Configuración local

1. Ejecuta `npm install`.
2. Copia `server/.env.example` a `server/.env` y completa las variables.
3. Copia `web/.env.example` a `web/.env.local`.
4. Configura MongoDB.
5. Ejecuta `npm run seed -w server` después de definir `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`.
6. Ejecuta `npm run dev`.

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`

## Variables

### Backend privado

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_API_BASE`

### Frontend público

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`

Nunca copies un secreto backend al frontend ni al repositorio.

## Comandos

```powershell
npm install
npm run dev
npm run build
npm run test
npm run seed -w server
```

## Funcionalidad implementada

- Catálogo público con búsqueda y categorías.
- Registro, login, JWT y roles.
- Carrito persistente y checkout con total calculado por backend.
- Reserva de stock y cancelación de pago con liberación.
- Creación/captura PayPal Sandbox con validación de monto y estado.
- Historial de pedidos y captura PayPal desde la interfaz.
- Panel administrador de catálogo, stock y fulfillment.
- Socket.IO con handshake autenticado y salas privadas.
- Manejo seguro de validación, CORS, rate limiting y `/health`.

## Pruebas

```powershell
npm run test
```

La suite actual contiene 9 pruebas ejecutables para `/health`, 404, autenticación, roles, cantidades inválidas, propiedad, precio autoritativo, idempotencia y transiciones. Las pruebas de infraestructura con MongoDB, PayPal y TestSprite requieren las cuentas/variables de sus servicios.

## Despliegue Railway

Crear dos servicios desde el mismo repositorio:

- `server`: build `npm install && npm run build -w server`; start `npm run start -w server`.
- `web`: build `npm install && npm run build -w web`; start `npm run start -w web`.

Ambos deben exponer HTTPS. Configura `CLIENT_ORIGIN` con la URL exacta de frontend y `NEXT_PUBLIC_API_URL` con la URL de backend.

## Documentación de entrega

- [PRD.md](PRD.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API.md](docs/API.md)
- [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)
- [docs/TESTSPRITE_PLAN.md](docs/TESTSPRITE_PLAN.md)
- [docs/REFLECTION.md](docs/REFLECTION.md)
- [docs/RESULTS.md](docs/RESULTS.md)
- [Guia_Laboratorio_PlatoYa.md](Guia_Laboratorio_PlatoYa.md)
