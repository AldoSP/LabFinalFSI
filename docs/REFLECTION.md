# Reflexión individual

## 1. Trabajo de la IA

- **Actividades concretas realizadas por la IA:**
  - Generó la estructura inicial del monorepo (`web/` con Next.js App Router y `server/` con Express, TypeScript, Mongoose y Socket.IO).
  - Implementó modelos (`User`, `Book`, `Order`), rutas REST (`/api/auth`, `/api/books`, `/api/orders`, `/api/payments/paypal/*`), middleware de autenticación/roles, máquina de estados de pedidos, pruebas automatizadas (`server/src/*.test.ts`) y la documentación base (`PRD.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/SECURITY_AUDIT.md`, `docs/TESTSPRITE_PLAN.md`, `docs/RESULTS.md`).
  - Asistió en la preparación para despliegue en Railway (limpieza de `.env.example`, creación de `web/.env.local`, configuración de `trust proxy`, normalización de URLs) y en la depuración de errores reales de validación y captura PayPal.
- **Decisiones propuestas por la IA:**
  - Separar frontend (`web`) y backend (`server`) para aislar credenciales privadas y mantener Socket.IO en el mismo proceso de Express.
  - Recalcular totales autoritativamente desde MongoDB, reservar stock temporalmente durante el checkout con expiración de 15 minutos y verificar la captura PayPal en el servidor antes de marcar un pedido como `PAID`.
- **Errores o límites encontrados en sus respuestas:**
  - La verificación inicial de captura PayPal (`server/src/routes/payments.ts`) leía el monto desde `purchase_units[0].amount`, campo que PayPal Orders v2 omite normalmente en la respuesta de captura (el monto viene en `purchase_units[0].payments.captures[0].amount`), lo que provocaba rechazos `422` tras capturar el pago en Sandbox y dejaba el `providerOrderId` bloqueado.
  - El cliente API del frontend (`web/src/lib/api.ts`) descartaba el detalle `issues` de los errores `400`, mostrando únicamente `"Datos inválidos"` sin indicar qué campo fallaba ni que el límite máximo por título era `10`.
  - La configuración de `express-rate-limit` no incluía `app.set("trust proxy", 1)` inicialmente, y en `web/.env.example` había quedado un `NEXT_PUBLIC_PAYPAL_CLIENT_ID` que debía moverse a `web/.env.local`.
  - La IA no podía crear ni configurar las cuentas externas (MongoDB Atlas, PayPal Sandbox, Railway, TestSprite), por lo que esa parte se realizó manualmente.

## 2. Verificación

- **Builds y pruebas ejecutados:**
  - `npm run build -w web`: compilación de producción de Next.js sin errores.
  - `npm run test`: compilación TypeScript del backend y ejecución de `10/10` pruebas automatizadas sobre salud (`/health`), rutas `404`, rechazo anónimo, autorización por rol, cantidades inválidas, cálculo autoritativo de precios, propiedad de pedidos, idempotencia de captura, verificación de captura PayPal Orders v2 y transiciones de estado.
- **Flujos reproducidos manualmente:**
  - Verificación de `/health` (`{"status":"ok"}`) y carga del catálogo público en `https://ebook-store-web-production.up.railway.app`.
  - Registro/inicio de sesión, armado del carrito, validación del formulario de checkout (correo, país, notas y límite de 10 unidades por libro) y flujo completo de pago en PayPal Sandbox hasta confirmar la captura del pedido.
  - *(Agregar aquí si verificaste manualmente `/admin`, avance de estados en el tablero Kanban y actualización en tiempo real en `/orders` vía WebSockets.)*
- **Pruebas con TestSprite:**
  - Ejecución exploratoria de tipo Live Web App sobre `https://ebook-store-web-production.up.railway.app/#catalogo` (los créditos de la cuenta se agotaron antes de correr toda la suite `Run All`).
  - Se validó la comprobación de campo obligatorio `country` en checkout, la redirección del pago hacia PayPal Sandbox (limitada en modo automático por requerir sesión de comprador Sandbox) y el filtro `Ficción`; el agente reportó fallos de clic de su herramienta de navegador sobre otros botones de categoría y checkout como invitado.
- **Fallos encontrados y corregidos en el camino:**
  1. `ZodError` al arrancar el backend en Railway porque `CLIENT_ORIGIN` se ingresó inicialmente sin el prefijo `https://`.
  2. `Application failed to respond` / fallo de conexión a MongoDB Atlas en Railway hasta habilitar `0.0.0.0/0` en **Network Access** de Atlas.
  3. `NetworkError when attempting to fetch resource` en el frontend por discrepancia CORS de `CLIENT_ORIGIN` hasta ajustarlo al dominio exacto de Railway y redesplegar.
  4. `400 Datos inválidos` poco claro al superar el límite de 10 unidades por libro en el carrito persistido (`localStorage`); se expuso el detalle de errores Zod en UI, se aclaró el mensaje en español y se limitó/normalizó el carrito en `StoreProvider.tsx` y `CartDrawer.tsx`.
  5. Captura PayPal rechazada con `422` después de aprobar el cobro en Sandbox por leer `purchase_units[0].amount` en lugar de `captures[0].amount`; corregido junto con prueba unitaria de regresión y limpieza de `providerOrderId` para reintentos.

## 3. Decisiones tomadas manualmente

- **Interpretación de gestión de envíos:** Al tratarse de libros electrónicos (`EPUB`, `PDF`, `MOBI`), los envíos se modelaron como entrega digital con registro de correo, país y notas de despacho, usando un tablero de estados (`PAID` → `PROCESSING` → `READY_FOR_DELIVERY` → `DELIVERED_DIGITALLY` → `DELIVERED`).
- **Arquitectura, estados, roles y límites de confianza:** Se mantuvo la separación entre frontend Next.js y backend Express/Socket.IO, asignando el rol `customer` desde el servidor en el registro y restringiendo `/admin` y los cambios de estado a `admin`.
- **Servicios y configuración elegidos:** MongoDB Atlas (tier gratuito), PayPal Developer Sandbox, Railway (dos servicios independientes conectados al repositorio de GitHub) y TestSprite (Live Web App).

## 4. Infraestructura y servicios

- **MongoDB Atlas:** Creación de proyecto/clúster, usuario de base de datos, carga de datos iniciales con `npm run seed -w server` y configuración de acceso de red (`0.0.0.0/0` para permitir conexión desde las IPs dinámicas de Railway).
- **PayPal Sandbox:** Creación de app Sandbox y configuración de `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` únicamente en variables privadas del backend (`NEXT_PUBLIC_PAYPAL_CLIENT_ID` pública en frontend).
- **Railway frontend/backend:** Configuración de dos servicios desde el mismo monorepo (`server` y `web`), asignación de comandos `build`/`start`, generación de dominios HTTPS públicos y enlace de `CLIENT_ORIGIN` y `NEXT_PUBLIC_API_URL`.
- **TestSprite:** Configuración de proyecto Live Web App con `PRD.md` y cuenta de prueba dedicada; ejecución exploratoria inicial antes de agotar los créditos disponibles en la cuenta.

## 5. Aprendizajes y limitaciones

- **Qué aprendiste del desarrollo asistido por IA:** Personalmente, es aterradora la manera en que los modelos LLM automatizan gran parte del proceso de desarrollo, pero a la vez es muy emocionante. Aprendí a hacer el flujo completo de desarrollo de una aplicación con inteligencia artificial y ciertamente aprendí dónde están sus mayores deficiencias.
- **Qué no aceptarías automáticamente de un asistente:** Considero que se debe ser muy cuidadoso con la calidad del software. Siento que estos modelos no deberían ser usados como factor decisorio en pruebas de software y la calidad del mismo; debe haber un criterio humano que pueda evaluarlo y mantenerlo a raya. Tampoco aceptaría cambios sensibles a sectores críticos de la arquitectura, pues se necesita precaución en los servicios que mantienen vivo un aplicativo.
- **Limitaciones conocidas que no se resolvieron:**
  - Las portadas usan URLs externas de demostración (Unsplash) y no se almacenan ni descargan archivos reales (`EPUB`/`PDF`/`MOBI`).
  - `0.0.0.0/0` en MongoDB Atlas se dejó habilitado por las IPs dinámicas de Railway en entorno de laboratorio.
  - Los créditos de TestSprite se agotaron tras la fase exploratoria inicial antes de completar la ejecución total de casos (`Run All`).
- **Mejora prioritaria si continuara el proyecto:** Completar la sección de colecciones del aplicativo y simular la entrega digital de los archivos. Completar una suite de tests end-to-end con Playwright.