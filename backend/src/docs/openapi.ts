import { z } from "zod";
import { createDocument, type ZodOpenApiResponsesObject } from "zod-openapi";
import { env } from "../config/env.ts";
import {
  AUTH_BASE_PATH,
  REFRESH_COOKIE,
} from "../modules/auth/auth.controller.ts";
import {
  loginSchema,
  meSchema,
  registerSchema,
  sessionSchema,
} from "../modules/auth/auth.schemas.ts";
import { COURSES_ADMIN_BASE_PATH } from "../modules/courses/courses-admin.controller.ts";
import {
  enrollmentSchema,
  enrollmentWithCourseSchema,
} from "../modules/enrollments/enrollments.schemas.ts";
import {
  categorySchema,
  courseSchema,
  coursesListSchema,
  createCourseSchema,
  updateCourseSchema,
} from "../modules/courses/courses.schemas.ts";
import {
  createLessonSchema,
  createModuleSchema,
  FREE_PREVIEW_LESSONS,
  lessonSchema,
  modulePublicSchema,
  moduleSchema,
  updateLessonSchema,
  updateModuleSchema,
} from "../modules/modules/modules.schemas.ts";

const errorSchema = z
  .object({
    error: z.object({
      code: z.string().meta({ example: "INVALID_CREDENTIALS" }),
      message: z.string().meta({ example: "Invalid email or password" }),
      details: z
        .record(z.string(), z.array(z.string()))
        .optional()
        .meta({
          description: "Solo en `VALIDATION_ERROR`: errores por campo",
          example: { email: ["Invalid email"] },
        }),
    }),
  })
  .meta({ id: "Error" });

function errorResponse(description: string) {
  return {
    description,
    content: { "application/json": { schema: errorSchema } },
  };
}

function sessionResponse(description: string) {
  return {
    description,
    headers: {
      "Set-Cookie": {
        description: `Cookie \`${REFRESH_COOKIE}\` (httpOnly) con el refresh token. Solo se envía a \`${AUTH_BASE_PATH}\`.`,
        schema: { type: "string" },
      },
    },
    content: { "application/json": { schema: sessionSchema } },
  } as const;
}

const validationError = errorResponse(
  "`VALIDATION_ERROR`: el body no cumple el esquema. `INVALID_JSON`: el body no es JSON válido.",
);
const tooManyRequests = errorResponse(
  "`TOO_MANY_REQUESTS`: se superó el límite de intentos. El header `RateLimit` indica cuándo se reinicia.",
);

const commonErrors = {
  "429": tooManyRequests,
  "500": errorResponse("`INTERNAL_ERROR`: error inesperado del servidor."),
} satisfies ZodOpenApiResponsesObject;

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: {
    title: "SkillUp Campus API",
    version: "1.0.0",
    description: `
API de SkillUp Campus.

## Cómo funciona la sesión

1. \`POST /auth/register\` o \`POST /auth/login\` devuelven un **access token** (JWT, dura ${env.JWT_ACCESS_TTL_SECONDS / 60} minutos) en el body y dejan un **refresh token** en la cookie httpOnly \`${REFRESH_COOKIE}\` (dura ${env.REFRESH_TOKEN_TTL_DAYS} días).
2. Las rutas protegidas reciben el access token en el header \`Authorization: Bearer <token>\`. En esta página, usa el botón **Authorize** y pega solo el token.
3. Cuando el access token expira (\`401 TOKEN_EXPIRED\`), \`POST /auth/refresh\` entrega uno nuevo y **rota** el refresh token: el anterior deja de servir.
4. \`POST /auth/logout\` revoca el refresh token y borra la cookie.

Si un refresh token ya usado se vuelve a enviar, se considera robado y se cierran **todas** las sesiones del usuario.

## Errores

Todos los errores tienen la forma \`{ "error": { "code", "message", "details"? } }\`. El frontend debe decidir según el \`code\`, no según el \`message\`.

## Límites de intentos

| Ruta | Límite |
| --- | --- |
| Todo \`/auth\` | 100 solicitudes cada 15 min por IP |
| \`POST /auth/register\` | 5 cuentas por hora por IP |
| \`POST /auth/login\` | 5 intentos fallidos cada 15 min por IP y email, y 20 por IP |
`.trim(),
  },
  servers: [{ url: "/api/v1", description: "Servidor actual" }],
  tags: [
    { name: "Auth", description: "Registro, inicio de sesión y sesión" },
    { name: "System", description: "Operaciones de sistema (health check)" },
    { name: "Categories", description: "Categorías de cursos" },
    { name: "Courses", description: "Catálogo público de cursos" },
    { name: "Admin — Courses", description: "CRUD de cursos (solo admin)" },
    { name: "Enrollments", description: "Inscripciones del estudiante" },
    {
      name: "Modules & Lessons",
      description: "Módulos y lecciones de un curso",
    },
    { name: "Progress", description: "Progreso del estudiante en un curso" },
    { name: "Admin — Users", description: "Gestión de usuarios (solo admin)" },
    {
      name: "Admin — Stats",
      description: "Estadísticas de la plataforma (solo admin)",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token devuelto por login, register o refresh.",
      },
      refreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: REFRESH_COOKIE,
        description:
          "La pone el servidor al hacer login. El navegador la envía sola; no hace falta copiarla.",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description:
          "Verifica que el servidor y la base de datos estén disponibles. Utilizado por el balanceador de carga y los checks de despliegue en Render.",
        responses: {
          "200": {
            description: "Servicio operativo.",
            content: {
              "application/json": {
                schema: z
                  .object({ status: z.literal("ok") })
                  .meta({ id: "HealthOkResponse" }),
              },
            },
          },
          "503": {
            description: "Base de datos no disponible.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    status: z.literal("error"),
                    db: z.literal("down"),
                  })
                  .meta({ id: "HealthErrorResponse" }),
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registrar un estudiante",
        description:
          "Crea una cuenta con rol `student` e inicia sesión. No se pueden crear docentes ni admins por esta ruta.\n\nEl email se guarda en minúsculas y sin espacios. La contraseña debe tener entre 8 y 128 caracteres.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: registerSchema } },
        },
        responses: {
          "201": sessionResponse("Cuenta creada y sesión iniciada."),
          "400": validationError,
          "409": errorResponse(
            "`EMAIL_TAKEN`: ya existe una cuenta con ese email.",
          ),
          ...commonErrors,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Iniciar sesión",
        description:
          "Sirve para estudiantes y admins. La respuesta incluye el `role` del usuario para que el frontend sepa a qué panel redirigir.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: loginSchema } },
        },
        responses: {
          "200": sessionResponse("Sesión iniciada."),
          "400": validationError,
          "401": errorResponse(
            "`INVALID_CREDENTIALS`: email o contraseña incorrectos. Es el mismo error exista o no el email.",
          ),
          "403": errorResponse(
            "`ACCOUNT_SUSPENDED`: la contraseña es correcta pero la cuenta está suspendida.",
          ),
          ...commonErrors,
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Renovar la sesión",
        description:
          "Usa la cookie `refresh_token` para emitir un access token nuevo y rotar el refresh token. No lleva body.",
        security: [{ refreshCookie: [] }],
        responses: {
          "200": sessionResponse("Sesión renovada."),
          "401": errorResponse(
            "`INVALID_SESSION`: no hay cookie, o el refresh token no existe, expiró o ya fue usado. La cookie se borra.",
          ),
          "403": errorResponse(
            "`ACCOUNT_SUSPENDED`: la cuenta fue suspendida. Se cierran todas sus sesiones.",
          ),
          ...commonErrors,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Cerrar sesión",
        description:
          "Revoca el refresh token de la cookie y la borra. Responde 204 aunque no haya sesión.",
        security: [{ refreshCookie: [] }],
        responses: {
          "204": { description: "Sesión cerrada." },
          ...commonErrors,
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Usuario de la sesión",
        description: "Devuelve los datos del usuario dueño del access token.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Usuario autenticado.",
            content: { "application/json": { schema: meSchema } },
          },
          "401": errorResponse(
            "`UNAUTHORIZED`: falta el header. `INVALID_TOKEN`: token inválido. `TOKEN_EXPIRED`: hay que llamar a `/auth/refresh`. `INVALID_SESSION`: el usuario ya no existe.",
          ),
          "403": errorResponse(
            "`ACCOUNT_SUSPENDED`: la cuenta está suspendida.",
          ),
          ...commonErrors,
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Listar categorías",
        description:
          "Devuelve todas las categorías ordenadas por nombre. Disponible para todos sin autenticación.",
        responses: {
          "200": {
            description: "Lista de categorías.",
            content: {
              "application/json": {
                schema: z
                  .object({ categories: z.array(categorySchema) })
                  .meta({ id: "CategoriesResponse" }),
              },
            },
          },
          ...commonErrors,
        },
      },
    },
    "/courses": {
      get: {
        tags: ["Courses"],
        summary: "Listar cursos publicados",
        description:
          "Devuelve el catálogo paginado. Solo muestra cursos con `status = published`. Disponible para todos sin autenticación.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, maximum: 50 },
          },
          { name: "categoryId", in: "query", schema: { type: "integer" } },
          {
            name: "featured",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: 'Solo "true" o "false". Otros valores devuelven 400.',
          },
        ],
        responses: {
          "200": {
            description: "Lista de cursos publicados.",
            content: { "application/json": { schema: coursesListSchema } },
          },
          "400": validationError,
          ...commonErrors,
        },
      },
    },
    [`/courses/slug/{slug}`]: {
      get: {
        tags: ["Courses"],
        summary: "Obtener un curso publicado por slug",
        description:
          "Devuelve el detalle de un curso publicado a partir de su slug. Devuelve 404 si no existe o está en draft.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Curso encontrado.",
            content: {
              "application/json": {
                schema: z
                  .object({ course: courseSchema })
                  .meta({ id: "CourseBySlugResponse" }),
              },
            },
          },
          "404": errorResponse(
            "`NOT_FOUND`: el curso no existe o no está publicado.",
          ),
          ...commonErrors,
        },
      },
    },
    [`/courses/{id}`]: {
      get: {
        tags: ["Courses"],
        summary: "Obtener un curso publicado",
        description:
          "Devuelve el detalle de un curso publicado. Devuelve 404 si no existe o está en draft.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Curso encontrado.",
            content: {
              "application/json": {
                schema: z
                  .object({ course: courseSchema })
                  .meta({ id: "CourseResponse" }),
              },
            },
          },
          "400": errorResponse(
            "`VALIDATION_ERROR`: el id no es un UUID válido.",
          ),
          "404": errorResponse(
            "`NOT_FOUND`: el curso no existe o no está publicado.",
          ),
          ...commonErrors,
        },
      },
    },
    [`${COURSES_ADMIN_BASE_PATH.replace("/api/v1", "")}`]: {
      get: {
        tags: ["Admin — Courses"],
        summary: "Listar todos los cursos (admin)",
        description:
          "Devuelve el catálogo paginado para el panel de administración. A diferencia del catálogo público, muestra **todos los estados** (`draft` y `published`) salvo que se filtre explícitamente. `courses.total` en `/admin/stats` incluye también los cursos en borrador.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, maximum: 50 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["draft", "published"] },
            description: "Filtra por estado. Omitir devuelve ambos.",
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "integer" },
          },
          {
            name: "featured",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "Lista paginada de cursos (draft + published).",
            content: { "application/json": { schema: coursesListSchema } },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`: falta el token."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es admin."),
          ...commonErrors,
        },
      },
      post: {
        tags: ["Admin — Courses"],
        summary: "Crear un curso",
        description: "Crea un curso nuevo. Solo admins.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: createCourseSchema } },
        },
        responses: {
          "201": {
            description: "Curso creado.",
            content: {
              "application/json": {
                schema: z
                  .object({ course: courseSchema })
                  .meta({ id: "CourseCreatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`: falta el token."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es admin."),
          "409": errorResponse(
            "`SLUG_TAKEN`: ya existe un curso con ese slug.",
          ),
          ...commonErrors,
        },
      },
    },
    [`${COURSES_ADMIN_BASE_PATH.replace("/api/v1", "")}/{id}`]: {
      get: {
        tags: ["Admin — Courses"],
        summary: "Obtener un curso por id (admin)",
        description:
          "Devuelve el detalle completo de un curso (incluyendo `draft`). Solo admins.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Curso encontrado.",
            content: {
              "application/json": {
                schema: z
                  .object({ course: courseSchema })
                  .meta({ id: "AdminCourseResponse" }),
              },
            },
          },
          "400": errorResponse(
            "`VALIDATION_ERROR`: el id no es un UUID válido.",
          ),
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse("`NOT_FOUND`: el curso no existe."),
          ...commonErrors,
        },
      },
      put: {
        tags: ["Admin — Courses"],
        summary: "Actualizar un curso",
        description:
          "Actualiza los campos enviados. Los campos no enviados no cambian.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: updateCourseSchema } },
        },
        responses: {
          "200": {
            description: "Curso actualizado.",
            content: {
              "application/json": {
                schema: z
                  .object({ course: courseSchema })
                  .meta({ id: "CourseUpdatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse("`NOT_FOUND`: el curso no existe."),
          "409": errorResponse("`SLUG_TAKEN`"),
          ...commonErrors,
        },
      },
      delete: {
        tags: ["Admin — Courses"],
        summary: "Eliminar un curso",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": { description: "Curso eliminado." },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse("`NOT_FOUND`: el curso no existe."),
          "409": errorResponse(
            "`COURSE_HAS_ENROLLMENTS`: el curso tiene estudiantes inscritos.",
          ),
          ...commonErrors,
        },
      },
    },

    "/enrollments": {
      post: {
        tags: ["Enrollments"],
        summary: "Inscribirse a un curso",
        description:
          "Inscribe al estudiante autenticado en un curso publicado y gratuito (priceCents = 0).",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: z
                .object({ courseId: z.uuid() })
                .meta({ id: "EnrollRequest" }),
            },
          },
        },
        responses: {
          "201": {
            description: "Inscripción creada.",
            content: {
              "application/json": {
                schema: z
                  .object({ enrollment: enrollmentSchema })
                  .meta({ id: "EnrollResponse" }),
              },
            },
          },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse(
            "`FORBIDDEN`: el usuario no es estudiante. `COURSE_NOT_FREE`: el curso tiene un precio mayor a 0.",
          ),
          "404": errorResponse(
            "`NOT_FOUND`: el curso no existe o no está publicado.",
          ),
          "409": errorResponse(
            "`ALREADY_ENROLLED`: el estudiante ya está inscrito.",
          ),
          ...commonErrors,
        },
      },
    },
    "/enrollments/me": {
      get: {
        tags: ["Enrollments"],
        summary: "Mis inscripciones",
        description:
          "Lista las inscripciones del estudiante autenticado con datos del curso.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista de inscripciones.",
            content: {
              "application/json": {
                schema: z
                  .object({ enrollments: z.array(enrollmentWithCourseSchema) })
                  .meta({ id: "MyEnrollmentsResponse" }),
              },
            },
          },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          ...commonErrors,
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin — Users"],
        summary: "Listar usuarios",
        description:
          "Listado paginado de usuarios. Admite filtros por role, status y búsqueda por email o nombre.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 20, maximum: 50 },
          },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["student", "teacher", "admin"] },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["active", "suspended"] },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Busca por email o nombre.",
          },
        ],
        responses: {
          "200": {
            description: "Lista de usuarios.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    data: z.array(
                      z.object({
                        id: z.uuid(),
                        email: z.string(),
                        fullName: z.string(),
                        role: z.string(),
                        status: z.string(),
                        createdAt: z.iso.datetime(),
                      }),
                    ),
                    pagination: z.object({
                      page: z.number(),
                      limit: z.number(),
                      total: z.number(),
                      totalPages: z.number(),
                    }),
                  })
                  .meta({ id: "UsersListResponse" }),
              },
            },
          },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          ...commonErrors,
        },
      },
    },
    "/admin/users/{id}/status": {
      patch: {
        tags: ["Admin — Users"],
        summary: "Cambiar estado de un usuario",
        description:
          "Suspende o activa una cuenta. Al suspender revoca todos los refresh tokens. No se puede suspender un admin ni la propia cuenta.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: z
                .object({ status: z.enum(["active", "suspended"]) })
                .meta({ id: "UpdateStatusRequest" }),
            },
          },
        },
        responses: {
          "200": {
            description: "Estado actualizado.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    user: z.object({
                      id: z.uuid(),
                      email: z.string(),
                      fullName: z.string(),
                      role: z.string(),
                      status: z.string(),
                      createdAt: z.iso.datetime(),
                    }),
                  })
                  .meta({ id: "UserStatusResponse" }),
              },
            },
          },
          "400": errorResponse("`VALIDATION_ERROR`"),
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse(
            "`FORBIDDEN`: no es admin, intenta suspender a un admin, o se auto-suspende.",
          ),
          "404": errorResponse("`NOT_FOUND`: usuario no existe."),
          ...commonErrors,
        },
      },
    },
    [`/courses/{courseId}/modules`]: {
      get: {
        tags: ["Modules & Lessons"],
        summary: "Listar módulos y lecciones de un curso",
        description: `Devuelve todos los módulos y lecciones de un curso publicado, ordenados por posición. Disponible para todos sin autenticación.

Cada lección incluye \`locked: boolean\`. Cuando \`locked\` es \`true\`, \`videoUrl\` viene en \`null\` para no exponer el contenido de pago.

**Regla de desbloqueo:**
- Las ${FREE_PREVIEW_LESSONS} primeras lecciones del curso (en orden global: módulo por posición ascendente, luego lección por posición ascendente) siempre tienen \`locked: false\`.
- Un alumno con inscripción activa o completada en este curso (cualquier estado) ve todas las lecciones desbloqueadas.
- Un admin ve todas las lecciones desbloqueadas.
- Anónimos y usuarios sin inscripción solo ven las ${FREE_PREVIEW_LESSONS} primeras.

Acepta un \`Authorization: Bearer <token>\` opcional. Si el token es inválido o vencido, se trata como anónimo (no devuelve 401).`,
        security: [{ bearerAuth: [] }, {}],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description:
              "Lista de módulos con sus lecciones. Lecciones con `locked: true` tienen `videoUrl: null`.",
            headers: {
              Vary: {
                description:
                  "Always `Authorization` — caches must serve different responses per auth state.",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: z
                  .object({ modules: z.array(modulePublicSchema) })
                  .meta({ id: "ModulesListResponse" }),
              },
            },
          },
          "400": errorResponse(
            "`VALIDATION_ERROR`: courseId no es un UUID válido.",
          ),
          "404": errorResponse(
            "`NOT_FOUND`: el curso no existe o no está publicado.",
          ),
          ...commonErrors,
        },
      },
    },
    [`/admin/courses/{courseId}/modules`]: {
      post: {
        tags: ["Modules & Lessons"],
        summary: "Crear un módulo (admin)",
        description:
          "Crea un módulo en un curso. Solo admins. La posición es única por curso; repetirla devuelve 409 `POSITION_TAKEN`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: createModuleSchema } },
        },
        responses: {
          "201": {
            description: "Módulo creado.",
            content: {
              "application/json": {
                schema: z
                  .object({ module: moduleSchema })
                  .meta({ id: "ModuleCreatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`: falta el token."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es admin."),
          "404": errorResponse("`NOT_FOUND`: el curso no existe."),
          "409": errorResponse(
            "`POSITION_TAKEN`: ya existe un módulo con esa posición.",
          ),
          ...commonErrors,
        },
      },
    },
    [`/admin/courses/{courseId}/modules/{moduleId}`]: {
      put: {
        tags: ["Modules & Lessons"],
        summary: "Actualizar un módulo (admin)",
        description:
          "Actualiza los campos enviados del módulo. El módulo debe pertenecer al curso de la URL.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: updateModuleSchema } },
        },
        responses: {
          "200": {
            description: "Módulo actualizado.",
            content: {
              "application/json": {
                schema: z
                  .object({ module: moduleSchema })
                  .meta({ id: "ModuleUpdatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse(
            "`NOT_FOUND`: el módulo no existe o no pertenece al curso.",
          ),
          "409": errorResponse("`POSITION_TAKEN`."),
          ...commonErrors,
        },
      },
      delete: {
        tags: ["Modules & Lessons"],
        summary: "Eliminar un módulo (admin)",
        description:
          "Elimina un módulo y, en cascada, sus lecciones. El módulo debe pertenecer al curso de la URL.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": { description: "Módulo eliminado." },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse("`NOT_FOUND`: el módulo no existe."),
          ...commonErrors,
        },
      },
    },
    [`/admin/courses/{courseId}/modules/{moduleId}/lessons`]: {
      post: {
        tags: ["Modules & Lessons"],
        summary: "Crear una lección (admin)",
        description:
          "Crea una lección dentro de un módulo. La posición es única por módulo; repetirla devuelve 409 `POSITION_TAKEN`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: createLessonSchema } },
        },
        responses: {
          "201": {
            description: "Lección creada.",
            content: {
              "application/json": {
                schema: z
                  .object({ lesson: lessonSchema })
                  .meta({ id: "LessonCreatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse(
            "`NOT_FOUND`: el módulo no existe o no pertenece al curso.",
          ),
          "409": errorResponse("`POSITION_TAKEN`."),
          ...commonErrors,
        },
      },
    },
    [`/admin/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}`]: {
      put: {
        tags: ["Modules & Lessons"],
        summary: "Actualizar una lección (admin)",
        description:
          "Actualiza los campos enviados de la lección. La lección debe pertenecer al módulo y curso de la URL.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "lessonId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: updateLessonSchema } },
        },
        responses: {
          "200": {
            description: "Lección actualizada.",
            content: {
              "application/json": {
                schema: z
                  .object({ lesson: lessonSchema })
                  .meta({ id: "LessonUpdatedResponse" }),
              },
            },
          },
          "400": validationError,
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse(
            "`NOT_FOUND`: la lección no existe o no pertenece al módulo.",
          ),
          "409": errorResponse("`POSITION_TAKEN`."),
          ...commonErrors,
        },
      },
      delete: {
        tags: ["Modules & Lessons"],
        summary: "Eliminar una lección (admin)",
        description:
          "Elimina una lección. La lección debe pertenecer al módulo y curso de la URL.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "lessonId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "204": { description: "Lección eliminada." },
          "401": errorResponse("`UNAUTHORIZED`"),
          "403": errorResponse("`FORBIDDEN`"),
          "404": errorResponse("`NOT_FOUND`: la lección no existe."),
          ...commonErrors,
        },
      },
    },
    [`/enrollments/{enrollmentId}/progress`]: {
      get: {
        tags: ["Progress"],
        summary: "Obtener el progreso de una inscripción",
        description:
          "Devuelve el progreso del estudiante autenticado en la inscripción indicada. Solo el dueño de la inscripción puede consultarlo.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "enrollmentId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "Progreso de la inscripción.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    enrollmentId: z.uuid(),
                    progressPercent: z.number().int().min(0).max(100),
                    status: z.enum(["active", "completed"]),
                    total: z.number().int(),
                    completedLessons: z.array(
                      z.object({
                        lessonId: z.uuid(),
                        completedAt: z.iso.datetime(),
                      }),
                    ),
                  })
                  .meta({ id: "ProgressResponse" }),
              },
            },
          },
          "400": errorResponse(
            "`VALIDATION_ERROR`: enrollmentId no es un UUID válido.",
          ),
          "401": errorResponse("`UNAUTHORIZED`."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es estudiante."),
          "404": errorResponse("`NOT_FOUND`: la inscripción no existe."),
          ...commonErrors,
        },
      },
    },
    [`/enrollments/{enrollmentId}/progress/lessons/{lessonId}/complete`]: {
      post: {
        tags: ["Progress"],
        summary: "Marcar una lección como completada",
        description:
          "Registra la lección como completada para la inscripción y recalcula el porcentaje. La lección debe pertenecer al curso de la inscripción. Si ya estaba completada devuelve 409 `ALREADY_COMPLETED`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "enrollmentId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
          {
            name: "lessonId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "201": {
            description: "Lección marcada como completada.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    lessonId: z.uuid(),
                    completedAt: z.iso.datetime(),
                    progressPercent: z.number().int().min(0).max(100),
                  })
                  .meta({ id: "CompleteLessonResponse" }),
              },
            },
          },
          "400": errorResponse("`VALIDATION_ERROR`."),
          "401": errorResponse("`UNAUTHORIZED`."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es estudiante."),
          "404": errorResponse(
            "`NOT_FOUND`: la inscripción o la lección no existen, o la lección no pertenece al curso.",
          ),
          "409": errorResponse("`ALREADY_COMPLETED`."),
          ...commonErrors,
        },
      },
    },
    [`/admin/stats`]: {
      get: {
        tags: ["Admin — Stats"],
        summary: "Estadísticas de la plataforma (admin)",
        description:
          "Devuelve métricas generales: total de cursos (y publicados), estudiantes, inscripciones (y completadas), tasa de finalización y top 5 cursos por estudiantes. `courses.total` incluye los cursos en borrador (`draft`); `courses.published` es el subconjunto publicado.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Estadísticas de la plataforma.",
            content: {
              "application/json": {
                schema: z
                  .object({
                    courses: z.object({
                      total: z.number().int(),
                      published: z.number().int(),
                    }),
                    students: z.object({ total: z.number().int() }),
                    enrollments: z.object({
                      total: z.number().int(),
                      completed: z.number().int(),
                    }),
                    completionRate: z.number(),
                    topCourses: z.array(
                      z.object({
                        id: z.uuid(),
                        slug: z.string(),
                        title: z.string(),
                        studentsCount: z.number().int(),
                        ratingAvg: z.number().nullable(),
                        priceCents: z.number().int(),
                        currency: z.string().length(3),
                      }),
                    ),
                  })
                  .meta({ id: "StatsResponse" }),
              },
            },
          },
          "401": errorResponse("`UNAUTHORIZED`: falta el token."),
          "403": errorResponse("`FORBIDDEN`: el usuario no es admin."),
          ...commonErrors,
        },
      },
    },
  },
});
