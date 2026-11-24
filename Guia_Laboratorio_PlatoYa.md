# Guía de laboratorio: Generación de aplicaciones con inteligencia artificial

**Herramientas:** Cursor · Next.js · Node.js/Express · MongoDB Atlas · PayPal · WebSockets · Railway · TestSprite  
**Profesor:** DIEGO JOSE LUIS BOTIA  
**Año:** 2026

---

> **Nota de transcripción:** Se omitieron las imágenes del documento original. Cada página que contenía una imagen incluye una nota en el punto correspondiente. Se conservó el texto extraíble del PDF; las tablas se presentan como texto cuando la extracción no permitió reconstruir fielmente sus columnas.

## Página 1

GUÍA DE LABORATORIO Generación de aplicaciones con inteligencia artificial Herramientas: Cursor · Next.js · Node.js/Express · MongoDB Atlas · PayPal · WebSockets · Railway · TestSprite

Profesor:  DIEGO JOSE LUIS BOTIA  
2026

---

## Página 2

Control del documento Versión 1.0 · 12 de noviembre de 2026 Nota de alcance El documento propone una aplicación full-stack con cliente/cocinero, menú, carrito, dirección, pago PayPal, pedidos y tablero Kanban en tiempo real. Esta guía desarrolla esa propuesta como laboratorio didáctico y agrega controles de seguridad, pruebas y despliegue. Los nombres exactos de menús y los planes gratuitos pueden cambiar.

### 1. Introducción

La generación de aplicaciones con IA no consiste únicamente en pedirle código a un asistente. Requiere formular requisitos, revisar un plan, validar decisiones de arquitectura, construir por incrementos, ejecutar pruebas, gestionar secretos y desplegar con observabilidad. En este laboratorio se construirá PlatoYa, una aplicación de pedidos de restaurante asistida por Cursor. La solución separa la interfaz web del backend. Next.js renderiza la experiencia de usuario; un backend Node.js/Express expone las API REST y mantiene conexiones WebSocket; MongoDB Atlas persiste usuarios, platos, pedidos y pagos; PayPal Sandbox simula los pagos; Railway aloja los servicios; TestSprite ayuda a proponer y ejecutar pruebas sobre la aplicación desplegada.

### 1.1 Resultados de aprendizaje

•
Convertir una necesidad de negocio en un prompt estructurado y un plan de implementación revisable.

•
Aplicar desarrollo asistido por IA con Cursor sin aceptar cambios a ciegas.

•
Configurar una base de datos administrada en MongoDB Atlas y conectar la aplicación mediante variables de entorno.

•
Diseñar un flujo de pago con PayPal Sandbox que valide el pago en el servidor.

•
Implementar notificaciones de cambios de pedido con WebSockets y controlar acceso por roles.

•
Desplegar frontend y backend en Railway y verificar configuración, logs y disponibilidad.

•
Crear un plan de pruebas funcionales con TestSprite, revisar resultados y corregir defectos.

### 1.2 Producto mínimo viable

•
Registro e inicio de sesión con roles cliente y cocinero.

•
Catálogo de platos con categoría, descripción, precio, disponibilidad e imagen.

•
Carrito y dirección de entrega; resumen y creación de pedido.

•
Pago simulado en PayPal Sandbox; el pedido solo queda pagado tras confirmación del backend.

•
Historial de pedidos para clientes.

•
Panel de cocina con columnas Pendiente, En preparación, Listo y Entregado.

•
Actualización en tiempo real del estado de los pedidos mediante WebSockets.

•
API protegida, validación de datos, manejo de errores y despliegue en Railway.

### 2. Arquitectura de referencia

La arquitectura propuesta es un monorepo estruturado así: Next.js se usa para la interfaz, mientras que las API REST y WebSockets se ubican en un backend Node.js/Express separado. Esto permite que Socket.IO comparta el proceso del backend y que la lógica de pagos no dependa del navegador.

---

## Página 3

Navegador | +---- HTTPS ----> Next.js (frontend, Railway) | +---- HTTPS/REST + WSS ----> Node.js + Express + Socket.IO (Railway) | +---- Mongoose ----> MongoDB Atlas | +---- HTTPS API ----> PayPal Sandbox TestSprite ----> URL pública del frontend / API desplegada

### 2.1 Responsabilidades y límites de confianza

El navegador nunca decide por sí solo que un pedido está pagado, no define el precio final y no puede cambiar estados reservados al cocinero. El backend recalcula los importes con precios consultados en la base de datos, verifica el resultado de PayPal y autoriza cada operación. MongoDB Atlas no debe exponerse públicamente con credenciales privilegiadas. Advertencia de seguridad No publiques claves privadas, tokens JWT, contraseñas de base de datos ni el secreto de PayPal en prompts, repositorios, capturas o variables NEXT_PUBLIC_*. Si una credencial se expone, revócala y genera una nueva.

Figura 1. Imágenes iniciales del documento fuente: prompt de Cursor en modo Plan y revisión de la arquitectura.

> **[Imagen del documento original en la página 3; omitida en esta versión Markdown.]**

---

## Página 4

### 3. Preparación del entorno

### 3.1 Requisitos

•
Windows 10/11, navegador actualizado y conexión a Internet.

•
Cursor instalado y una cuenta con acceso al asistente de IA.

•
Node.js LTS y npm; comprobar con node --version y npm --version.

•
Git instalado; comprobar con git --version.

•
Cuenta de MongoDB Atlas, cuenta de desarrollador PayPal y cuenta Railway.

•
Cuenta o acceso a TestSprite. La disponibilidad de funciones puede depender del plan.

### 3.2 Verificación inicial en PowerShell

```text
node --version
```

```text
npm --version
```

```text
git --version
```

Si alguno de los comandos no se reconoce, instala la herramienta desde su sitio oficial, cierra y vuelve a abrir PowerShell y verifica nuevamente.

### 3.3 Crear el proyecto

### 1. Crea una carpeta llamada platoya en una ruta de trabajo sin caracteres especiales, por ejemplo

C:\\dev\\platoya.  
### 2. Abre Cursor y selecciona File > Open Folder; abre la carpeta platoya.

### 3. Inicializa Git desde la terminal integrada si aún no existe un repositorio.

### 4. Crea un archivo README.md con el objetivo, actores, alcance y comandos para ejecutar el proyecto.

### 5. Antes de pedir generación de código, escribe los requisitos y acuerda la arquitectura con el asistente.

```text
mkdir C:\\dev\\platoya
```

```text
cd C:\\dev\\platoya
```

```text
git init
```

> **[Imagen del documento original en la página 4; omitida en esta versión Markdown.]**

---

## Página 5

### 4. Ingeniería de prompts con Cursor

Colocar el prompt en modo Plan, revisar el plan antes de construir y después pulsar Build. El modo Plan debe utilizarse para discutir arquitectura y tareas, no para autorizar automáticamente cualquier decisión.

### 4.1 Prompt inicial para el modo Plan

Figura 2. Capturas del documento fuente sobre la estructura inicial, variables de entorno y creación del proyecto Atlas.

> **[Imagen del documento original en la página 5; omitida en esta versión Markdown.]**

---

## Página 6

Despues de unos minutos revise la estructura del proyecto generado.  También puede revisar el archivo .env que tiene la plantilla de credenciales básicas que toca configurar.

### 4.2 Revisar el plan generado

### 1. Comprueba que las API REST y los WebSockets estén en el backend Node.js/Express separado.

### 2. Verifica que el backend sea responsable de autenticar, autorizar, validar importes y confirmar pagos.

### 3. Solicita que los modelos incluyan estados y marcas de tiempo; evita guardar datos de tarjeta.

### 4. Pide pruebas unitarias o de integración para login, permisos, pedido y pago.

### 5. Corrige tareas ambiguas y exige criterios de aceptación observables.

### 6. Solo cuando el plan sea coherente, autoriza la construcción con Build/Agent según la versión de Cursor.

Práctica recomendada No pidas “construye todo y no preguntes”. Trabaja por entregas: esqueleto y conexión a datos; autenticación; catálogo y carrito; pedidos; PayPal; WebSockets; despliegue; pruebas. Revisa el diff y ejecuta pruebas después de cada entrega.

### 5. Modelo de datos y API

### 5.1 Colecciones sugeridas

Colección Campos principales Reglas

users  
name, email, passwordHash, role, createdAt role ∈ cliente, cocinero; nunca guardar contraseña en claro

dishes  
name, description, category, price, imageUrl, available precio numérico positivo; validar disponibilidad en servidor

orders  
userId, items, address, total, status, paymentStatus, timestamps el total se recalcula en servidor; guardar snapshot de precio

payments  
orderId, provider, providerOrderId, captureId, amount, status no almacenar datos de tarjeta; evitar capturas duplicadas

### 5.2 Estados de pedido

```text
Pedido: PENDING_PAYMENT -> PAID/PENDIENTE -> PREPARING -> READY -> DELIVERED
```

```text
Pago:   CREATED -> APPROVED -> CAPTURED
```

\-> FAILED / CANCELLED Usa una máquina de estados explícita. Un evento de interfaz no debe permitir saltar arbitrariamente de Pendiente a Entregado. Define qué rol puede ejecutar cada transición.

> **[Imagen del documento original en la página 6; omitida en esta versión Markdown.]**

---

## Página 7

### 5.3 Endpoints de referencia

Método y ruta Propósito Acceso POST /api/auth/register Crear usuario cliente Público; rol cliente asignado por servidor POST /api/auth/login Iniciar sesión Público; protección contra abuso GET /api/dishes Consultar menú Público POST /api/orders Crear pedido pendiente de pago Cliente autenticado GET /api/orders/me Historial del usuario Cliente autenticado; solo propios pedidos

PATCH /api/orders/:id/status  
Cambiar estado del pedido Cocinero autorizado POST /api/payments/paypal/order Crear orden PayPal Cliente propietario del pedido POST /api/payments/paypal/capture Capturar pago y confirmar pedido Backend verifica orden y propiedad

### 6. Configurar MongoDB Atlas

Crea en MongoDB Atlas el proyecto PlatoYa, un clúster gratuito, configuración de acceso de red, usuario de base de datos y selección del driver Node.js. Las pantallas pueden variar; el objetivo es obtener una URI de conexión protegida.

### 6.1 Crear proyecto y clúster

### 1. Entra a https://cloud.mongodb.com/ y crea un proyecto llamado PlatoYa.

### 2. Crea un clúster de desarrollo. Selecciona un nivel gratuito si está disponible para tu cuenta y región.

### 3. Crea un usuario de base de datos exclusivo para la aplicación; usa una contraseña larga y única.

### 4. En Network Access, agrega la IP desde la que desarrollarás. Evita 0.0.0.0/0 salvo una prueba temporal

controlada; no lo dejes como configuración de producción.

### 5. En Connect, selecciona Drivers y Node.js; copia la URI entregada por Atlas.

### 6. Reemplaza el marcador de posición de la contraseña de forma segura y codifica caracteres especiales si

corresponde.

### 7. Crea una base de datos llamada platoya y verifica que el backend pueda conectarse.

```text
# server/.env (ejemplo; reemplaza los valores localmente)
```

```text
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base>?retryWrites=true&w=majority
```

```text
PORT=4000
```

```text
CLIENT_ORIGIN=http://localhost:3000
```

```text
JWT_SECRET=<secreto-largo-aleatorio>
```

```text
PAYPAL_CLIENT_ID=<sandbox-client-id>
```

```text
PAYPAL_CLIENT_SECRET=<sandbox-client-secret>
```

```text
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
```

---

## Página 8

Figura 3. Imágenes del documento fuente sobre el plan de tareas, configuración de MongoDB y conexión del driver.

### 6.2 Instalar Mongoose y comprobar conexión

```text
cd server
```

```text
npm install mongoose dotenv
```

> **[Imagen del documento original en la página 8; omitida en esta versión Markdown.]**

---

## Página 9

### 6.2 Validación

### 1. Inicia el backend y confirma que el log indique conexión exitosa sin mostrar secretos.

### 2. Abre Atlas Data Explorer y verifica que se creen las colecciones al insertar documentos.

### 3. Registra un usuario de prueba y confirma que passwordHash no sea la contraseña original.

### 4. Prueba una desconexión deliberada (por ejemplo, URI incorrecta en entorno local) y verifica que la

aplicación falle de forma controlada.

Figura 4. Capturas originales de MongoDB Atlas: proyecto, clúster, acceso, driver Node.js y explorador de datos.

> **[Imagen del documento original en la página 9; omitida en esta versión Markdown.]**

---

## Página 10

> **[Imagen del documento original en la página 10; omitida en esta versión Markdown.]**

---

## Página 11

> **[Imagen del documento original en la página 11; omitida en esta versión Markdown.]**

---

## Página 12

> **[Imagen del documento original en la página 12; omitida en esta versión Markdown.]**

---

## Página 13

### 7. Integración de PayPal Sandbox

### 7.1 Crear credenciales de prueba

1- Entra a https://developer.paypal.com/ e inicia sesión.  
2- Abre Apps & Credentials y selecciona el entorno Sandbox. 3- Crea una aplicación para PlatoYa y copia el Client ID y Secret de Sandbox. 4- Guarda las credenciales en las variables del backend. El Secret nunca debe aparecer en código frontend. 5- Crea o utiliza cuentas Sandbox de comprador y vendedor para probar la aprobación del pago.

> **[Imagen del documento original en la página 13; omitida en esta versión Markdown.]**

---

## Página 14

### 7.2 Flujo de pago recomendado

### 1. El cliente confirma carrito y dirección; el frontend envía solo identificadores de platos y cantidades.

### 2. El backend consulta precios y disponibilidad en MongoDB, calcula el total y crea un pedido con estado

pendiente de pago.

### 3. El backend solicita a PayPal una orden con el importe calculado y devuelve al frontend únicamente los

datos necesarios para iniciar la aprobación.

### 4. El comprador aprueba el pago en el entorno Sandbox.

### 5. El frontend solicita al backend la captura de la orden; el backend invoca PayPal, verifica estado, importe,

moneda e identificador de pedido.

### 6. Solo después de una captura verificada el backend marca el pago como capturado y el pedido como

pagado/pendiente.

### 7. El backend emite un evento WebSocket para actualizar el tablero de cocina y el historial del cliente.

Criterio de aceptación Cambiar el total desde las herramientas del navegador no debe cambiar el importe capturado. Un usuario no puede capturar ni consultar el pago de un pedido que pertenece a otra persona. Las solicitudes repetidas no deben producir cobros o pedidos duplicados.

### 7.3 Pruebas de pago

•
Pago aprobado: el pedido queda confirmado y aparece en el panel de cocina.

•
Pago cancelado: el pedido permanece sin pagar y el usuario puede reintentar.

•
Error de red o PayPal: mostrar mensaje seguro y permitir recuperación sin duplicar el pedido.

•
Intento de modificar el importe: el backend rechaza la inconsistencia.

•
Repetición de captura: devolver el resultado conocido o impedir una segunda captura.

### 8. WebSockets y seguimiento en tiempo real

WebSockets mantienen una conexión bidireccional para notificar cambios sin que el cliente tenga que consultar la API continuamente. La propuesta fuente utiliza Socket.IO dentro del mismo proceso Express que aloja las API.

### 8.1 Eventos sugeridos

Evento Emisor Uso

order:created  
Backend Notificar un pedido pagado al canal

> **[Imagen del documento original en la página 14; omitida en esta versión Markdown.]**

---

## Página 15

de cocina

order:statusChanged  
Backend Propagar cambio de estado autorizado

order:updated  
Backend Actualizar historial del cliente

connection:error  
Cliente/servidor Mostrar estado de reconexión

### 8.2 Implementación conceptual

# En el backend: concepto de emisión, no código completo de producción

```text
io.to("kitchen").emit("order:created", publicOrderSummary)
```

```text
io.to(`user:${order.userId}`).emit("order:updated", publicOrderSummary)
```

El servidor debe autenticar el handshake, asociar al usuario con su canal y validar el rol antes de permitir suscripciones. No confíes en un nombre de sala enviado por el navegador. Envía solo los datos mínimos necesarios; no difundas dirección ni datos personales a todos los clientes.

### 8.3 Pruebas manuales

### 1. Abre dos navegadores o perfiles: uno como cliente y otro como cocinero.

### 2. Completa un pago Sandbox aprobado desde el cliente.

### 3. Comprueba que el pedido aparezca en el tablero de cocina sin recargar la página.

### 4. Cambia el estado desde la cuenta de cocinero y verifica la actualización del historial del cliente.

### 5. Desconecta la red y reconéctala; verifica reconexión y sincronización mediante una consulta REST de

recuperación.

### 9. Construcción iterativa en Cursor

Usa solicitudes acotadas, criterios de aceptación y revisión de cambios. En cada iteración pide a Cursor que indique archivos modificados, decisiones relevantes, comandos ejecutados y pruebas pendientes. Sprint 1 — Estructura, base de datos y autenticación

•
Crear carpetas web y server, scripts de desarrollo y README.

•
Configurar Express, CORS limitado al origen de frontend, JSON y manejo centralizado de errores.

•
Conectar Mongoose a Atlas.

•
Implementar registro/login, hash de contraseña, validación y roles.

•
Crear seed de platos de demostración sin datos personales reales. Sprint 2 — Menú, carrito y pedidos

•
Construir catálogo responsive y filtros por categoría.

•
Implementar carrito y formulario de dirección.

•
Crear endpoint de pedido que recalcule total en backend.

•
Implementar historial y autorización por propiedad del pedido.

•
Agregar pruebas de precios, cantidades inválidas y usuario no autenticado. Sprint 3 — PayPal y WebSockets

•
Crear y capturar órdenes PayPal desde backend.

•
Agregar idempotencia y estados de pago.

•
Configurar Socket.IO y canales autenticados.

•
Implementar tablero Kanban con transiciones de estado válidas.

•
Verificar actualización de cliente y cocinero en dos sesiones separadas.

---

## Página 16

Sprint 4 — Despliegue y pruebas

•
Preparar variables de entorno de producción para cada servicio.

•
Desplegar frontend y backend en Railway.

•
Configurar URL pública, CORS y WebSocket seguro (WSS).

•
Ejecutar suite de TestSprite; analizar fallos y corregirlos.

•
Repetir pruebas críticas después de cada cambio.

### 10. Despliegue en Railway

Usaremos el CLI de Railway en PowerShell, la autorización de la cuenta y la instalación de Railway Agent Skills. Las pantallas y comandos disponibles pueden variar; verifica la documentación oficial si un comando cambia.

### 10.1 Preparar el repositorio

### 1. Confirma que el proyecto se ejecuta localmente y que los tests básicos pasan.

### 2. Asegúrate de que .env, tokens y archivos locales de configuración estén excluidos de Git.

### 3. Añade scripts start y build apropiados en package.json para cada servicio.

### 4. Comprueba que el backend escucha en process.env.PORT y enlaza en 0.0.0.0.

### 5. Añade una ruta GET /health que devuelva estado sin exponer configuración sensible.

### 10.2 Instalar e iniciar sesión en CLI

# En PowerShell, si Scoop está instalado:  
```text
scoop install railway
```

# Alternativa: instala Railway CLI siguiendo la documentación oficial.

```text
railway --version
```

```text
railway login
```

Autoriza el CLI desde el navegador. La instalación de Skills es opcional; revisa el contenido y los permisos antes de instalar herramientas que puedan ejecutar comandos o modificar infraestructura.

```text
npx skills add railwayapp/railway-skills
```

### 10.2 Crear y configurar servicios

### 1. Crea un proyecto Railway y configura un servicio para el backend Node.js/Express.

### 2. Configura el comando de inicio y las variables MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN y

credenciales PayPal Sandbox o producción según el ambiente.

### 3. Genera el dominio público del backend y prueba /health.

### 4. Crea un segundo servicio para Next.js, usando el repositorio y la configuración de build/start adecuada.

### 5. Configura en frontend la URL pública de la API como variable pública no secreta; en backend, establece

CLIENT_ORIGIN con el dominio exacto del frontend.

### 6. Comprueba que Socket.IO funcione mediante HTTPS/WSS y que el proxy de despliegue admita conexiones

WebSocket.

### 7. Revisa los logs de ambos servicios y ejecuta el flujo completo en el entorno desplegado.

No confundir variables

```text
NEXT_PUBLIC_API_URL puede contener una URL pública de API; nunca debe contener secretos.
```

MONGODB_URI, JWT_SECRET y PAYPAL_CLIENT_SECRET deben existir solo en el backend.

---

## Página 17

### 10.4 Lista de verificación de despliegue

•
Frontend abre por HTTPS y no muestra errores de consola críticos.

•
Backend responde en /health y las rutas protegidas rechazan solicitudes anónimas.

•
CORS permite únicamente los orígenes necesarios.

•
MongoDB Atlas acepta la conexión desde el backend desplegado.

•
PayPal usa el entorno correcto y las credenciales corresponden a ese entorno.

•
WebSockets se conectan y se recuperan tras una interrupción.

•
Logs y mensajes de error no imprimen secretos ni datos personales innecesarios.

> **[Imagen del documento original en la página 17; omitida en esta versión Markdown.]**

---

## Página 18

> **[Imagen del documento original en la página 18; omitida en esta versión Markdown.]**

---

## Página 19

### 11. Pruebas con TestSprite

Crea una suite de tipo Live Web App, indicar el nombre del proyecto, el tipo Frontend UI o Backend API, la URL pública, si requiere inicio de sesión y una cuenta de prueba; después propone generar un PRD, planear los casos y ejecutar Run All.

### 11.1 Preparar la aplicación

### 1. Despliega una versión estable de PlatoYa y confirma que la URL pública funciona.

### 2. Crea cuentas de prueba con datos ficticios: cliente y cocinero. Usa credenciales dedicadas y revocables.

### 3. Prepara platos de demostración y un entorno PayPal Sandbox; no uses pagos reales para las pruebas.

### 4. Documenta los requisitos y criterios de aceptación en PRD.md.

> **[Imagen del documento original en la página 19; omitida en esta versión Markdown.]**

---

## Página 20

### 5. Asegúrate de que la aplicación no contenga datos personales reales ni credenciales incrustadas.

### 11.2 Crear el proyecto TestSprite

### 6. Abre TestSprite y crea una nueva suite/proyecto.

### 7. Selecciona Live Web App si vas a probar la URL desplegada. Para una ejecución local, elige el flujo

local/IDE disponible en tu cuenta.

### 8. Asigna el nombre PlatoYa y elige Frontend UI para recorridos de usuario o Backend API para endpoints.

### 9. Introduce la URL pública correcta y define si el flujo requiere login.

### 10. Usa una cuenta de prueba con permisos limitados; no introduzcas la contraseña de una cuenta personal.

### 11. Adjunta o redacta el PRD con funcionalidades, roles, restricciones y resultados esperados.

### 12. Genera los casos propuestos y revisa cada uno antes de ejecutarlo.

### 11.3 Casos de prueba mínimos

Área Caso Resultado esperado Prioridad Entrada pública Abrir el menú sin sesión El menú público carga; no expone funciones privadas Alta Acceso Login con credenciales válidas/inválidas Acceso correcto o error genérico seguro Alta Roles Cliente intenta abrir panel de cocina Acceso denegado en interfaz y servidor Alta Catálogo Filtrar por categoría y ver plato Resultados coherentes con disponibilidad Media Carrito Agregar, quitar y cambiar cantidades Subtotal y total correctos Alta Pedido Enviar precio alterado desde cliente Backend recalcula y no confía en el precio recibido Alta Pago Completar PayPal Sandbox Captura verificada; pedido confirmado una sola vez Alta Pago Cancelar o simular fallo No se marca como pagado; se informa al usuario Alta Historial Consultar pedido de otro usuario Acceso denegado Alta Tiempo real Cocinero cambia estado Cliente autorizado recibe actualización Alta Validación Enviar cantidad negativa o dirección vacía Solicitud rechazada con mensaje claro Media Despliegue Recargar y navegar por rutas internas Sin errores de ruta ni pérdida indebida de sesión Media

### 11.4 Ejecutar y analizar resultados

### 13. Selecciona las áreas funcionales pertinentes, por ejemplo Landing/Public Entry, Account Access, Menu

Catalog, Cart & Delivery, Payment & PayPal Checkout, Order History y Real-Time Order Tracking.

### 14. Revisa los nombres, pasos y datos de cada test propuesto; elimina pruebas ambiguas y corrige

precondiciones.

### 15. Ejecuta Run All o la opción equivalente.

### 16. Clasifica cada fallo: defecto funcional, problema de ambiente, dato de prueba inválido o falso positivo.

### 17. Abre la evidencia (capturas, pasos, mensajes) y reproduce manualmente los fallos críticos.

---

## Página 21

### 18. Pide a Cursor que corrija un defecto concreto, revisa el diff y vuelve a ejecutar pruebas de regresión.

### 19. Registra la tasa de éxito, fallos abiertos, severidad y decisión de liberación.

Uso responsable de agentes de prueba TestSprite puede proponer y ejecutar acciones automatizadas; eso no garantiza cobertura completa ni seguridad. Revisa los pasos antes de correrlos, limita permisos y evita pruebas destructivas contra datos reales.

> **[Imagen del documento original en la página 21; omitida en esta versión Markdown.]**

---

## Página 22

> **[Imagen del documento original en la página 22; omitida en esta versión Markdown.]**

---

## Página 23

> **[Imagen del documento original en la página 23; omitida en esta versión Markdown.]**

---

## Página 24

> **[Imagen del documento original en la página 24; omitida en esta versión Markdown.]**

---

## Página 25

### 12.2 Prompt de revisión de seguridad

Revisa el cambio actual de PlatoYa como auditor de seguridad.

No modifiques archivos todavía. Identifica:  
- secretos expuestos o variables mal ubicadas;
- fallos de autorización por rol o por propiedad del pedido;
- confianza en precios o estados enviados por el navegador;
- vulnerabilidades en el flujo de creación/captura de PayPal;
- riesgos de WebSockets, CORS, validación, inyección y manejo de errores;
- pruebas faltantes y pasos para reproducir cada problema.
Clasifica hallazgos por severidad, cita archivos/líneas y espera mi aprobación antes de proponer modificaciones.

### 13. Entregables del laboratorio

Fecha de Entrega: 24 de Noviembre de 2026  
Realice una aplicación completa de comercio electrónico que permita la venta de libros electrónicos, la gestión de catalogo y stock y la gestión de envíos.

•
Repositorio Git con frontend, backend, README y .env.example sin secretos.

•
Diagrama de arquitectura y breve justificación de las decisiones.

•
Modelos de datos, endpoints documentados y reglas de autorización.

•
Aplicación funcional con catálogo, carrito, pedidos, Pasarela de pago y tablero en tiempo real.

•
URL de frontend y backend desplegados en Railway.

•
PRD.md y suite de pruebas TestSprite con evidencia de ejecución.

•
Informe de resultados con pruebas aprobadas, fallidas, defectos corregidos y limitaciones conocidas.

•
Reflexión individual: qué generó la IA, qué verificó el equipo y qué decisiones se tomaron manualmente.

### 15. Solución de problemas frecuentes

Síntoma Causa probable Acción

> **[Imagen del documento original en la página 25; omitida en esta versión Markdown.]**

---

## Página 26

MongoDB no conecta URI incorrecta, usuario/contraseña, IP no autorizada Verificar URI en entorno backend, Network Access y credenciales; no publicar la URI CORS en navegador CLIENT_ORIGIN no coincide con frontend Configurar el origen exacto y reiniciar servicio PayPal rechaza la orden Credenciales o entorno mezclados Verificar Sandbox/Live, Client ID, Secret y base URL Pedido aparece pagado sin captura El frontend actualiza estado por su cuenta Mover transición al backend y validar respuesta de captura WebSocket no conecta URL, proxy, CORS o handshake de autenticación Revisar WSS, logs y configuración de Socket.IO en Railway Funciona local pero falla en Railway Variable ausente, puerto fijo o comando incorrecto Usar process.env.PORT, revisar variables y logs de build/start TestSprite reporta fallos intermitentes Datos compartidos, latencia o ambiente inestable Aislar datos, repetir de forma controlada y separar defectos de ambiente

### Anexo A. Aplicación Generada

Las siguientes imágenes presentan las vistas de la aplicación generada:

> **[Imagen del documento original en la página 26; omitida en esta versión Markdown.]**

---

## Página 27

> **[Imagen del documento original en la página 27; omitida en esta versión Markdown.]**

---

## Página 28

### Anexo B. Referencias oficiales para consulta

•
Cursor: https://docs.cursor.com/  
•
MongoDB Atlas: https://www.mongodb.com/docs/atlas/  
•
Mongoose: https://mongoosejs.com/docs/  
•
PayPal Developer: https://developer.paypal.com/docs/  
•
Socket.IO: https://socket.io/docs/v4/  
•
Railway: https://docs.railway.com/  
•
TestSprite: https://docs.testsprite.com/ (si la URL o documentación cambia, acceder desde el sitio oficial de TestSprite)

---
