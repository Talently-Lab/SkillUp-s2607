# Pendientes: enrollments y users-admin

Puntos del review del PR #17 (commit `36f688f6`) que quedan para otro PR. Las líneas corresponden al estado de la rama `feat/enrollments` en ese commit.

## Prioridad alta

Hoy terminan en un **500**. Además cambian el contrato de la API, porque pasan a responder 409 con un código propio, así que me debe avisar cuando se arreglen para el front.

- [ ] `backend/src/db/schema/enrollments.ts:30`: desde que `courseId` pasó a `onDelete: "restrict"` (migración 0004), un `DELETE /admin/courses/:id` sobre un curso con inscritos tira una violación de FK (23503) que nadie captura, y responde 500. Antes respondía 204.
  - Agregar `isForeignKeyViolation` en `shared/errors/db-errors.ts`, siguiendo el modelo de `isUniqueViolation`.
  - Capturarlo en `courses.service.ts:77` y devolver `ConflictError("COURSE_HAS_ENROLLMENTS")`.
  - Documentar el 409 en el DELETE de `docs/openapi.ts`.
- [ ] `backend/src/modules/enrollments/enrollments.service.ts:15`: hay una condición de carrera. Dos requests simultáneos, por ejemplo un doble click, pasan los dos el chequeo previo, y el segundo choca con el índice único y responde 500. Envolver `create` en un `try/catch` con `isUniqueViolation` y devolver `ConflictError("ALREADY_ENROLLED")`.

## Prioridad media

- [ ] `backend/src/modules/users/users-admin.service.ts:55`: el service usa `db` y `refreshTokens` directamente, saltándose el repository, y vuelve a implementar `authRepository.revokeAllRefreshTokens`. Hacer que `usersAdminRepository.updateStatus` y `revokeAllRefreshTokens` acepten un `tx` opcional, y dejar en el service solo el armado de la transacción.
- [ ] `backend/src/modules/users/users-admin.service.ts:75`: a la revocación le falta el filtro `isNull(refreshTokens.revokedAt)`, así que pisa el `revokedAt` de tokens ya revocados y se pierde cuándo se revocó cada uno. Se corrige solo si se reutiliza `revokeAllRefreshTokens`.
- [ ] `backend/src/modules/users/users-admin.repository.ts:48`: `updateStatus` quedó como código muerto. Además, el `.returning({...})` del service (`users-admin.service.ts:60`) repite las columnas en vez de usar `PUBLIC_COLUMNS`.
- [ ] `backend/src/modules/users/users-admin.repository.ts:25`: `search` se pasa a `ilike` sin escapar `%` ni `_`, que actúan como comodines. Hay que escaparlos antes de armar el patrón.
- [ ] `backend/src/modules/enrollments/enrollments.service.ts:10`: un estudiante puede inscribirse gratis en cursos con `priceCents > 0`. Falta decidir qué pasa con los cursos de pago y dejarlo explícito: rechazarlos o dejar un TODO.

## Prioridad baja

- [ ] `backend/src/modules/users/users-admin.service.ts:43`: el `findFirst` y el chequeo de rol corren fuera de la transacción. Si se pasan adentro del `tx`, el `if (!updated)` de la línea 70 sobra.
- [ ] `backend/src/modules/users/users-admin.schemas.ts:9`: los enums `role` y `status` están escritos a mano, lo mismo en la línea 19. Usar `userRole.enumValues` y `userStatus.enumValues` para que no se desincronicen del schema.
- [ ] `backend/src/modules/courses/courses-admin.controller.ts:13`: `validateUuid` sigue duplicado acá y en `courses.controller.ts`. Migrar esas rutas a `validateParams`.
- [ ] `backend/src/docs/openapi.ts:400`: los bodies y las respuestas están redefinidos a mano en vez de reutilizar los schemas de los módulos.
  - El id `UpdateStatusRequest` (línea 541) no coincide con `UpdateUserStatusRequest`.
  - En las respuestas de users (líneas 510 y 552), `role` y `status` son `z.string()` en vez de enums. Esto afecta si el front genera tipos desde Swagger.

## Fuera de alcance (para tener en cuenta)

- `requireAuth` no consulta el `status` en la base, así que un usuario suspendido sigue usando su access token hasta que vence (15 min, `JWT_ACCESS_TTL_SECONDS`). Es aceptable mientras esté documentado.
