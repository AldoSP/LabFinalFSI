# Plan preparado para TestSprite

## Configuración utilizada

- Tipo: Live Web App (Frontend UI).
- Proyecto: Lectora.
- Frontend: `https://ebook-store-web-production.up.railway.app`
- Backend: `https://ebook-store-server-production.up.railway.app`
- Login: sí, con cuenta de prueba revocable.
- PRD: `PRD.md`.

## Casos mínimos

1. Abrir catálogo público sin sesión; carga sin funciones privadas.
2. Registrar e iniciar sesión con datos válidos; credenciales inválidas producen error genérico.
3. Cliente intenta abrir `/admin`; interfaz niega acceso y API devuelve 403.
4. Buscar/filtrar libros y abrir un libro disponible.
5. Agregar, cambiar cantidad y eliminar elementos; subtotal correcto.
6. Intentar cantidad negativa o checkout con país/email vacíos; rechazo claro.
7. Enviar un precio alterado desde cliente; backend conserva precio de MongoDB.
8. Completar PayPal Sandbox; solo tras captura queda pagado.
9. Cancelar PayPal; no queda pagado y stock se libera; puede reintentar.
10. Repetir captura; no duplica cobro ni estado.
11. Cliente consulta ID ajeno; acceso denegado.
12. Admin modifica stock y catálogo con datos válidos.
13. Admin intenta saltar estados; rechazo; transición válida actualiza cliente.
14. Dos sesiones reciben actualización sin recarga.
15. Desconectar red y reconectar; historial se recupera por REST.
16. Recargar y navegar rutas desplegadas sin errores 404 indebidos.

## Evidencia y resultados registrados

- **Fecha de ejecución:** 2026-11-24
- **URL evaluada:** `https://ebook-store-web-production.up.railway.app/#catalogo`
- **Cobertura alcanzada en TestSprite:** Se completó la exploración inicial guiada por IA antes de que se agotaran los créditos de la cuenta.
  - Verificó la validación de campo obligatorio (`country`) en el formulario de checkout.
  - Verificó la redirección hacia la pantalla de inicio de sesión de PayPal Sandbox al iniciar pago (la finalización requiere credenciales de comprador Sandbox).
  - Verificó el filtro `Ficción`; el agente reportó fallos intermitentes de su herramienta de clic sobre los botones `Tecnología`, `Diseño` y `Ensayo` y al intentar probar checkout como invitado, deteniéndose antes de completar `Run All` por límite de créditos.
- **Validación complementaria ejecutada:**
  - `npm run test` en `server`: 10/10 pruebas aprobadas (incluyendo regresión para captura PayPal Orders v2).
  - Verificación manual en Railway: catálogo, checkout, captura PayPal Sandbox y estado `PAID`.
