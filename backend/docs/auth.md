# Autenticación

API de autenticación para estudiantes y admins. La referencia completa de cada endpoint está en Swagger UI ([http://localhost:3000/docs](http://localhost:3000/docs)).

## Sesión

La sesión usa dos tokens:

- **Access token**: un JWT que dura 15 minutos. Viene en el body de la respuesta y se envía en el header `Authorization: Bearer <token>`. El frontend lo guarda **solo en memoria**, no en `localStorage`.
- **Refresh token**: un token aleatorio que dura 7 días. Viaja en la cookie `refresh_token` (httpOnly, no se puede leer desde JavaScript) y solo se envía a `/api/v1/auth`. En la base se guarda su hash SHA-256, nunca el token. Cada vez que se usa se rota, y si se reutiliza uno ya usado se cierran todas las sesiones del usuario.

| Método | Ruta                    | Auth   | Descripción                                     |
| ------ | ----------------------- | ------ | ----------------------------------------------- |
| POST   | `/api/v1/auth/register` | -      | Crea un estudiante e inicia sesión              |
| POST   | `/api/v1/auth/login`    | -      | Inicia sesión (estudiante o admin)              |
| POST   | `/api/v1/auth/refresh`  | Cookie | Renueva el access token y rota el refresh token |
| POST   | `/api/v1/auth/logout`   | Cookie | Revoca el refresh token y borra la cookie       |
| GET    | `/api/v1/auth/me`       | Bearer | Devuelve el usuario de la sesión                |

- El registro público siempre crea un `student`. El admin inicial se crea con `pnpm db:seed:admin`, que usa las variables `SEED_ADMIN_*` del `.env`.
- Las cuentas con `status = suspended` no pueden iniciar sesión ni renovar la sesión.
- Para proteger una ruta nueva se usan los middlewares de `shared/middlewares/authenticate.ts`: `requireAuth` y, si hace falta, `requireRole("admin")`.

Para el frontend:

- Las llamadas a `/auth/*` deben enviar `credentials: "include"` para que viaje la cookie. El origen del frontend debe estar en `CORS_ORIGIN`.
- Al cargar la app se llama a `POST /auth/refresh` para recuperar la sesión. Si una request responde `401 TOKEN_EXPIRED`, se llama a refresh y se reintenta.
- Si varias requests fallan a la vez, se debe hacer **un solo** refresh compartido entre ellas. Dos refresh en paralelo con la misma cookie se toman como reutilización y cierran la sesión.

## Cómo probar la API

Con el servidor levantado:

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs). Para probar `/auth/me`, haz login, copia el `accessToken` y pégalo en **Authorize**. La cookie de refresh la maneja el navegador.
- **OpenAPI en JSON**: [http://localhost:3000/docs/openapi.json](http://localhost:3000/docs/openapi.json), para importarlo en Postman o Insomnia.
- **`requests.http`**: abre el archivo en VS Code con la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) y haz clic en _Send Request_. Primero ejecuta el login o el registro, porque las demás requests usan el token de esa respuesta.

La documentación se genera a partir de los mismos esquemas de Zod que validan las requests, así que no se desincroniza. Se activa con `DOCS_ENABLED`, que por defecto es `true` fuera de producción.

## Códigos de error

Todos los errores responden `{ "error": { "code", "message", "details"? } }`. El frontend debe decidir según el `code`, no según el `message`.

| Código                | Estado | Cuándo                                                             |
| --------------------- | ------ | ------------------------------------------------------------------ |
| `VALIDATION_ERROR`    | 400    | El body no cumple el esquema. `details` trae errores por campo     |
| `INVALID_JSON`        | 400    | El body no es JSON válido                                          |
| `UNAUTHORIZED`        | 401    | Falta el header `Authorization`                                    |
| `INVALID_TOKEN`       | 401    | El access token es inválido                                        |
| `TOKEN_EXPIRED`       | 401    | El access token expiró: hay que llamar a `/auth/refresh`           |
| `INVALID_CREDENTIALS` | 401    | Email o contraseña incorrectos (mismo error si el email no existe) |
| `INVALID_SESSION`     | 401    | El refresh token no existe, expiró, fue revocado o ya se usó       |
| `ACCOUNT_SUSPENDED`   | 403    | La cuenta está suspendida                                          |
| `FORBIDDEN`           | 403    | El rol del usuario no tiene acceso a la ruta                       |
| `EMAIL_TAKEN`         | 409    | Ya existe una cuenta con ese email                                 |
| `PAYLOAD_TOO_LARGE`   | 413    | El body supera los 10 KB                                           |
| `TOO_MANY_REQUESTS`   | 429    | Se superó el límite de intentos                                    |
| `INTERNAL_ERROR`      | 500    | Error inesperado del servidor                                      |

## Límite de intentos

| Ruta                  | Límite                                                      |
| --------------------- | ----------------------------------------------------------- |
| Todo `/api/v1/auth`   | 100 solicitudes cada 15 min por IP                          |
| `POST /auth/register` | 5 cuentas por hora por IP                                   |
| `POST /auth/login`    | 5 intentos fallidos cada 15 min por IP y email, y 20 por IP |

Los contadores viven en memoria, así que se reinician al reiniciar el servidor. Con más de una instancia hay que moverlos a un store compartido (por ejemplo Redis) y configurar `TRUST_PROXY`.
