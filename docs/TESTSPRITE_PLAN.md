# Plan preparado para TestSprite

## Configuración prevista

- Tipo: Live Web App.
- Proyecto: Lectora.
- Frontend: URL Railway pública pendiente.
- Backend: URL Railway pública pendiente.
- Login: sí, con cuentas de prueba revocables.
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

## Evidencia que debe guardarse

- Fecha y versión desplegada.
- URLs, navegador y cuentas de prueba ficticias.
- Capturas/pasos de cada fallo crítico.
- Pass rate, fallos abiertos, severidad y decisión de liberación.
- Reproducción manual y commit/revisión de corrección.
- Ejecución final de regresión.

La evidencia real no puede generarse hasta completar Railway y autorizar TestSprite.
