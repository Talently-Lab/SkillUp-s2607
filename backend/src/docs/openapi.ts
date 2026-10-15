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
import { COURSES_BASE_PATH } from "../modules/courses/courses.controller.ts";
import { COURSES_ADMIN_BASE_PATH } from "../modules/courses/courses-admin.controller.ts";
import {
  courseSchema,
  coursesListSchema,
  createCourseSchema,
  updateCourseSchema,
} from "../modules/courses/courses.schemas.ts";

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
    { name: "Courses", description: "Catálogo público de cursos" },
    { name: "Admin — Courses", description: "CRUD de cursos (solo admin)" },
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
          ...commonErrors,
        },
      },
    },
  },
});
