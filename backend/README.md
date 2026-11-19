# SkillUp Campus - Backend

## Herramientas

Como herramientas generales de desarrollo se usan:

- **Node.js 24** como entorno de ejecución. Ejecuta TypeScript de forma nativa, sin compilar en desarrollo.
- **Express 5** para el servidor HTTP, con **cookie-parser** para leer la cookie del refresh token.
- **TypeScript** para el tipado.
- **Zod** para validar las variables de entorno y los datos de entrada.
- **jose** para firmar y verificar los JWT, y **argon2** (`@node-rs/argon2`) para hashear las contraseñas.
- **helmet**, **cors** y **express-rate-limit** para los headers de seguridad, el CORS y el límite de intentos.
- **zod-openapi** y **swagger-ui-express** para la documentación de la API.
- **Drizzle ORM** para el acceso a la base de datos y las migraciones, con el driver **pg**.
- **PostgreSQL** como base de datos (Docker en local, Neon en producción).
- **pino** y **pino-http** para los logs de la app y de las requests.
- **ESLint** para el linting y **Prettier** para el formato del código.

Como manejador de paquetes se usa [**pnpm**](https://pnpm.io/es).

## Arquitectura

El backend sigue una arquitectura de **modular monolith**: es un solo servidor, pero el código está dividido en módulos por dominio. Cada módulo agrupa sus propias rutas, lógica y acceso a datos, y lo que se comparte entre módulos vive en `shared`.

Actualmente el proyecto está estructurado así:

```
docs/                    # documentación del backend (auth y diagrama de la base de datos)
drizzle/                 # migraciones SQL generadas por drizzle-kit
requests.http            # requests listas para probar la API con REST Client
src/
├── config/
│   └── env.ts           # variables de entorno validadas con Zod
├── db/
│   ├── client.ts        # conexión a PostgreSQL (pool + instancia de Drizzle)
│   ├── schema/          # tablas de la base de datos, un archivo por dominio
│   ├── seed-admin.ts    # crea el usuario admin inicial
│   ├── seed-teacher.ts  # crea un docente para desarrollo
│   └── seed-catalog.ts  # carga el catálogo de demo para desarrollo
├── docs/                # documento OpenAPI y Swagger UI
├── modules/             # módulos por dominio
│   ├── activity/        # registro de los cambios hechos por el admin
│   ├── auth/            # registro, login, refresh, logout y usuario actual
│   ├── categories/      # listado de categorías de cursos
│   ├── course-modules/  # módulos de un curso y sus lecciones
│   ├── courses/         # catálogo y administración de cursos
│   ├── enrollments/     # inscripciones de los estudiantes
│   ├── progress/        # progreso del estudiante en las lecciones
│   ├── stats/           # estadísticas del panel de admin
│   ├── teacher/         # panel del docente
│   └── users/           # administración de usuarios
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
- **`modules`**: cada módulo se divide en capas `routes` → `controller` → `service` → `repository`, y sus esquemas de Zod. Los endpoints de admin van en sus propios archivos `*-admin.*` (como mínimo `*-admin.routes.ts` y `*-admin.controller.ts`, y también repository o schemas si los necesitan).
- **Dependencias entre módulos**: un módulo solo puede importar los archivos `*.service.ts`, `*.repository.ts` y `*.schemas.ts` de otro módulo, nunca sus rutas, controllers u otros archivos internos. Lo valida `pnpm lint` con `eslint-plugin-boundaries`. Si algo no pertenece a ningún dominio, se mueve a `shared`.
- **`course-modules`**: es el dominio de los módulos de un curso. Se llama así para no confundirse con la carpeta `modules/`, aunque su tabla y sus rutas siguen usando `modules`.
- **Errores**: los errores esperados se lanzan como `AppError` y el manejador global los convierte en una respuesta `{ error: { code, message, details? } }`. Los inesperados se registran en el log y responden `500`.
- **Imports**: los imports relativos llevan la extensión `.ts` (por ejemplo `./app.ts`), porque Node ejecuta TypeScript directamente. Por el mismo motivo no se usan `enum` ni `namespace`.

## Cómo levantar el proyecto

1. Si no tenés pnpm instalado, andá a [https://pnpm.io/es](https://pnpm.io/es) y seguí los pasos de instalación.

2. Usá la versión de Node definida en `.nvmrc` (con [nvm](https://github.com/nvm-sh/nvm)):

   ```bash
   nvm install
   nvm use
   ```

3. Dentro de la carpeta `backend`, instalá las dependencias:

   ```bash
   pnpm install
   ```

4. Copiá el archivo de variables de entorno y completá los valores:

   ```bash
   cp .env.example .env
   ```

   `JWT_ACCESS_SECRET` es obligatorio y tiene que tener al menos 32 caracteres. Generá uno con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   Completá también `SEED_ADMIN_PASSWORD` y, si vas a crear el docente de prueba, `SEED_TEACHER_PASSWORD`. Ambas vienen vacías.

   El resto de las variables ya tienen valores para desarrollo:

   | Variable       | Para qué sirve                                                                     |
   | -------------- | ---------------------------------------------------------------------------------- |
   | `DATABASE_URL` | Conexión a PostgreSQL. Ya apunta al contenedor de Docker                           |
   | `CORS_ORIGIN`  | Orígenes del frontend que pueden llamar a la API, separados por coma               |
   | `TRUST_PROXY`  | Cantidad de proxies delante de la API: `0` en local, normalmente `1` en producción |
   | `DOCS_ENABLED` | Activa Swagger UI en `/docs`. Por defecto está activo fuera de producción          |

5. Levantá la base de datos con Docker y aplicá las migraciones (ver la sección siguiente).

6. Ejecutá el entorno de desarrollo:

   ```bash
   pnpm dev
   ```

   El servidor queda en `http://localhost:3000` y se reinicia al guardar un archivo. Para comprobar que todo funciona:

   ```bash
   curl localhost:3000/health   # {"status":"ok"}
   ```

## Documentación

- [`docs/auth.md`](./docs/auth.md): cómo funciona la sesión, los códigos de error y cómo probar la API.
- [`docs/database.dbml`](./docs/database.dbml): diagrama de la base de datos en DBML (se puede ver en [dbdiagram.io](https://dbdiagram.io)).
- [`requests.http`](./requests.http): requests listas para probar la API con REST Client.
- Swagger UI en [http://localhost:3000/docs](http://localhost:3000/docs) con el servidor levantado.

## Base de datos con Docker

En desarrollo, PostgreSQL corre en un contenedor de Docker definido en `compose.yaml`. Necesitás tener instalado [Docker](https://docs.docker.com/get-docker/) con Docker Compose.

> En Linux, si Docker pide `sudo`, agregá tu usuario al grupo `docker` y volvé a iniciar sesión:
>
> ```bash
> sudo usermod -aG docker $USER
> ```

1. Dentro de la carpeta `backend`, levantá la base de datos. `--wait` espera a que esté lista para recibir conexiones:

   ```bash
   docker compose up -d --wait
   ```

2. Revisá que `DATABASE_URL` en el `.env` apunte al contenedor (es el valor que trae `.env.example`). El puerto es `5434` en tu máquina para no chocar con un PostgreSQL instalado localmente:

   ```bash
   DATABASE_URL=postgres://skillup-campus:skillup-campus@localhost:5434/skillup-campus
   ```

3. Aplicá las migraciones para crear las tablas:

   ```bash
   pnpm db:migrate
   ```

4. Creá el usuario admin con las variables `SEED_ADMIN_*` del `.env`. Si ya existe, no hace nada:

   ```bash
   pnpm db:seed:admin
   ```

5. (Opcional) Creá un docente para probar el panel docente con las variables `SEED_TEACHER_*` del `.env`. Si ya existe, no hace nada:

   ```bash
   pnpm db:seed:teacher
   ```

6. (Opcional) Cargá el catálogo de demo con categorías, cursos, módulos y clases. Se puede correr varias veces: agrega lo que falta y no borra nada:

   ```bash
   pnpm db:seed:catalog
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

1. Generá la migración con un nombre descriptivo:

   ```bash
   pnpm db:generate --name add-courses-table
   ```

2. Revisá el archivo `.sql` generado en `drizzle/` y aplicalo:

   ```bash
   pnpm db:migrate
   ```

3. Subí la migración junto con el cambio del esquema. El resto del equipo la aplica con `pnpm db:migrate` después de hacer `git pull`.

Nunca edites una migración que ya se aplicó: si hace falta un cambio, modificá el esquema y generá una nueva.

## Scripts

| Script                 | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `pnpm dev`             | Servidor de desarrollo con recarga automática |
| `pnpm build`           | Compila `src/` a `dist/`                      |
| `pnpm start`           | Ejecuta el build de producción                |
| `pnpm typecheck`       | Revisa los tipos sin generar archivos         |
| `pnpm lint`            | Revisa el código con ESLint                   |
| `pnpm lint:fix`        | Corrige automáticamente lo que ESLint pueda   |
| `pnpm format`          | Formatea el código con Prettier               |
| `pnpm format:check`    | Comprueba el formato sin modificar archivos   |
| `pnpm db:generate`     | Genera una migración a partir del esquema     |
| `pnpm db:migrate`      | Aplica las migraciones pendientes             |
| `pnpm db:studio`       | Abre Drizzle Studio para ver los datos        |
| `pnpm db:seed:admin`   | Crea el usuario admin inicial                 |
| `pnpm db:seed:teacher` | Crea un docente para desarrollo               |
| `pnpm db:seed:catalog` | Carga el catálogo de demo para desarrollo     |
