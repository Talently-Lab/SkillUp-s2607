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
  tags: [{ name: "Auth", description: "Registro, inicio de sesión y sesión" }],
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
          "Usa la cookie `refresh_token` para emitir un access token nuevo y rotar el refresh token. Sirve también para recuperar la sesión al recargar la página. No lleva body.",
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
          "Revoca el refresh token de la cookie y la borra. Responde 204 aunque no haya sesión. El frontend debe descartar el access token que tenga en memoria.",
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
  },
});
