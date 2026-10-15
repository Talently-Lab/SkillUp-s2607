# SkillUp Campus - Backend

## Herramientas

Como herramientas generales de desarrollo se usa:

- **Node.js 24** como entorno de ejecución. Ejecuta TypeScript de forma nativa, sin compilar en desarrollo.
- **Express 5** para el servidor HTTP.
- **TypeScript** para el tipado.
- **Zod** para validar las variables de entorno y los datos de entrada.
- **jose** para firmar y verificar los JWT, y **argon2** (`@node-rs/argon2`) para hashear las contraseñas.
- **helmet**, **cors** y **express-rate-limit** para los headers de seguridad, el CORS y el límite de intentos.
- **zod-openapi** y **swagger-ui-express** para la documentación de la API.
- **Drizzle ORM** para el acceso a la base de datos y las migraciones.
- **PostgreSQL** como base de datos (Docker en local, Neon en producción).
- **pino** para los logs.
- **ESLint** para el linting y **Prettier** para el formato del código.

Como manejador de paquetes se usa [**pnpm**](https://pnpm.io/es).

## Arquitectura

El backend sigue una arquitectura de **modular monolith**: es un solo servidor, pero el código está dividido en módulos por dominio. Cada módulo agrupa sus propias rutas, lógica y acceso a datos, y lo que se comparte entre módulos vive en `shared`.

Actualmente el proyecto está estructurado así:

```
drizzle/                 # migraciones SQL generadas por drizzle-kit
requests.http            # requests listas para probar la API con REST Client
src/
├── config/
│   └── env.ts           # variables de entorno validadas con Zod
├── db/
│   ├── client.ts        # conexión a PostgreSQL (pool + instancia de Drizzle)
│   ├── schema/          # tablas de la base de datos, un archivo por dominio
│   └── seed-admin.ts    # crea el usuario admin inicial
├── docs/                # documento OpenAPI y Swagger UI
├── modules/             # módulos por dominio (auth, courses, orders, etc.)
│   └── auth/            # registro, login, refresh, logout y usuario actual
├── shared/              # código compartido entre módulos
│   ├── errors/          # clases de error (AppError y sus variantes) y handler 404
│   ├── middlewares/     # errores, validación, autenticación y límite de intentos
│   ├── security/        # firma y verificación de JWT
│   └── logger.ts        # logger de pino
├── app.ts               # configuración de Express: middlewares y rutas
└── server.ts            # punto de entrada: levanta el servidor y lo apaga de forma ordenada
```

- **`app.ts` y `server.ts`** están separados para poder testear la app sin abrir un puerto.
- **`config/env.ts`** es el único lugar que lee `process.env`. Si falta una variable o es inválida, el servidor no arranca.
- **`modules`**: cada módulo se divide en capas `routes` → `controller` → `service` → `repository`, y sus esquemas de Zod. Un módulo no debería importar de otro módulo. Si algo se necesita en más de uno, se mueve a `shared`.
- **Errores**: los errores esperados se lanzan como `AppError` y el manejador global los convierte en una respuesta `{ error: { code, message, details? } }`. Los inesperados se registran en el log y responden `500`.
- **Imports**: los imports relativos llevan la extensión `.ts` (por ejemplo `./app.ts`), porque Node ejecuta TypeScript directamente. Por el mismo motivo no se usan `enum` ni `namespace`.

## Cómo levantar el proyecto

1. Si no tienes pnpm instalado, ve a [https://pnpm.io/es](https://pnpm.io/es) y sigue los pasos de instalación.

2. Usa la versión de Node definida en `.nvmrc` (con [nvm](https://github.com/nvm-sh/nvm)):

   ```bash
   nvm install
   nvm use
   ```

3. Dentro de la carpeta `backend`, instala las dependencias:

   ```bash
   pnpm install
   ```

4. Copia el archivo de variables de entorno y completa los valores:

   ```bash
   cp .env.example .env
   ```

   `JWT_ACCESS_SECRET` es obligatorio y debe tener al menos 32 caracteres. Genera uno con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

5. Levanta la base de datos con Docker y aplica las migraciones (ver la sección siguiente).

6. Ejecuta el entorno de desarrollo:

   ```bash
   pnpm dev
   ```

   El servidor queda en `http://localhost:3000` y se reinicia al guardar un archivo. Para comprobar que todo funciona:

   ```bash
   curl localhost:3000/health   # {"status":"ok"}
   ```

## Autenticación

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

## Documentación de la API

Con el servidor levantado:

- **Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs). Para probar `/auth/me`, haz login, copia el `accessToken` y pégalo en **Authorize**. La cookie de refresh la maneja el navegador.
- **OpenAPI en JSON**: [http://localhost:3000/docs/openapi.json](http://localhost:3000/docs/openapi.json), para importarlo en Postman o Insomnia.
- **`requests.http`**: abre el archivo en VS Code con la extensión [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) y haz clic en _Send Request_. Primero ejecuta el login o el registro, porque las demás requests usan el token de esa respuesta.

La documentación se genera a partir de los mismos esquemas de Zod que validan las requests, así que no se desincroniza. Se activa con `DOCS_ENABLED`, que por defecto es `true` fuera de producción.

## Base de datos con Docker

En desarrollo, PostgreSQL corre en un contenedor de Docker definido en `compose.yaml`. Necesitas tener instalado [Docker](https://docs.docker.com/get-docker/) con Docker Compose.

> En Linux, si Docker pide `sudo`, agrega tu usuario al grupo `docker` y vuelve a iniciar sesión:
>
> ```bash
> sudo usermod -aG docker $USER
> ```

1. Dentro de la carpeta `backend`, levanta la base de datos. `--wait` espera a que esté lista para recibir conexiones:

   ```bash
   docker compose up -d --wait
   ```

2. En el `.env`, apunta `DATABASE_URL` al contenedor. El puerto es `5434` en tu máquina para no chocar con un PostgreSQL instalado localmente:

   ```bash
   DATABASE_URL=postgres://skillup-campus:skillup-campus@localhost:5434/skillup-campus
   ```

3. Aplica las migraciones para crear las tablas:

   ```bash
   pnpm db:migrate
   ```

4. Crea el usuario admin con las variables `SEED_ADMIN_*` del `.env`. Si ya existe, no hace nada:

   ```bash
   pnpm db:seed:admin
   ```

Comandos útiles:

```bash
docker compose ps        # ver el estado del contenedor
docker compose logs db   # ver los logs de PostgreSQL
docker compose stop      # detener la base de datos (los datos se conservan)
docker compose down -v   # borrar el contenedor y los datos, para empezar de cero
pnpm db:studio           # abrir un panel web para ver los datos
```

Los datos se guardan en el volumen `pgdata`, así que no se pierden al detener o borrar el contenedor. Solo `docker compose down -v` los elimina.

### Cambios en el esquema

Cuando modifiques una tabla en `src/db/schema/`:

1. Genera la migración con un nombre descriptivo:

   ```bash
   pnpm db:generate --name add-courses-table
   ```

2. Revisa el archivo `.sql` generado en `drizzle/` y aplícalo:

   ```bash
   pnpm db:migrate
   ```

3. Sube la migración junto con el cambio del esquema. Tu compañero la aplica con `pnpm db:migrate` después de hacer `git pull`.

Nunca edites una migración que ya se aplicó: si hace falta un cambio, modifica el esquema y genera una nueva.

## Scripts

| Script               | Descripción                                   |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Servidor de desarrollo con recarga automática |
| `pnpm build`         | Compila `src/` a `dist/`                      |
| `pnpm start`         | Ejecuta el build de producción                |
| `pnpm typecheck`     | Revisa los tipos sin generar archivos         |
| `pnpm lint`          | Revisa el código con ESLint                   |
| `pnpm lint:fix`      | Corrige automáticamente lo que ESLint pueda   |
| `pnpm format`        | Formatea el código con Prettier               |
| `pnpm format:check`  | Comprueba el formato sin modificar archivos   |
| `pnpm db:generate`   | Genera una migración a partir del esquema     |
| `pnpm db:migrate`    | Aplica las migraciones pendientes             |
| `pnpm db:studio`     | Abre Drizzle Studio para ver los datos        |
| `pnpm db:seed:admin` | Crea el usuario admin inicial                 |
