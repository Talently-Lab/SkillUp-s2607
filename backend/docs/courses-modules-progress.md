# Cursos, Módulos, Lecciones y Progreso

Referencia de los endpoints de catálogo, módulos y progreso del estudiante. La referencia completa está en Swagger UI (http://localhost:3000/docs).

## Catálogo de cursos (público)

| Método | Ruta | Auth | Descripción |
| ------ | ---- | ---- | ----------- |
| GET | `/api/v1/courses` | - | Listado paginado de cursos publicados |
| GET | `/api/v1/courses/:id` | - | Detalle de un curso publicado |
| GET | `/api/v1/courses/:courseId/modules` | - | Módulos del curso con sus lecciones |

Los endpoints públicos solo devuelven cursos con `status = published`. Los drafts solo los ve el admin.

### Filtros disponibles en GET /courses

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| `page` | number | Página (default: 1) |
| `limit` | number | Resultados por página (max: 50, default: 20) |
| `categoryId` | number | Filtrar por categoría |
| `featured` | "true" o "false" | Solo cursos destacados |

---

## Admin — Gestión de cursos

Todos los endpoints de admin requieren `Authorization: Bearer <token>` con rol `admin`.

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/api/v1/admin/courses` | Listado de todos los cursos (draft y published) |
| GET | `/api/v1/admin/courses/:id` | Detalle de cualquier curso |
| POST | `/api/v1/admin/courses` | Crear curso |
| PUT | `/api/v1/admin/courses/:id` | Actualizar curso (campos parciales) |
| DELETE | `/api/v1/admin/courses/:id` | Eliminar curso |
| POST | `/api/v1/admin/courses/:courseId/modules` | Crear módulo |
| PUT | `/api/v1/admin/courses/:courseId/modules/:moduleId` | Actualizar módulo |
| DELETE | `/api/v1/admin/courses/:courseId/modules/:moduleId` | Eliminar módulo (elimina sus lecciones) |
| POST | `/api/v1/admin/courses/:courseId/modules/:moduleId/lessons` | Crear lección |
| PUT | `/api/v1/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Actualizar lección |
| DELETE | `/api/v1/admin/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Eliminar lección |

### Crear curso — campos requeridos



Campos opcionales con defaults: `level` (beginner), `priceCents` (0), `currency` (USD), `status` (draft), `featured` (false).

### Crear módulo



`position` determina el orden. Dos módulos del mismo curso no pueden tener la misma `position`.

### Crear lección



`videoUrl` es opcional. Dos lecciones del mismo módulo no pueden tener la misma `position`.

---

## Inscripciones y progreso del estudiante

Todos los endpoints de estudiante requieren `Authorization: Bearer <token>` con rol `student`.

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/v1/enrollments` | Inscribirse a un curso publicado |
| GET | `/api/v1/enrollments/me` | Mis inscripciones con datos del curso |
| GET | `/api/v1/enrollments/:enrollmentId/progress` | Progreso de una inscripción |
| POST | `/api/v1/enrollments/:enrollmentId/progress/lessons/:lessonId/complete` | Marcar lección como completada |

- Inscribirse devuelve `409 ALREADY_ENROLLED` si ya está inscrito.
- Solo funciona con cursos `status = published`.
- Al marcar una lección devuelve `409 ALREADY_COMPLETED` si ya fue marcada.
- Cuando `progressPercent` llega a 100, el `status` de la inscripción cambia a `completed` automáticamente.

### Respuesta de GET /enrollments/me

Cada item incluye los datos del curso con `id`, `slug`, `title`, `coverUrl`, `level`, `priceCents`, `currency`.

### Respuesta de GET /enrollments/:enrollmentId/progress

```
{
  "enrollmentId": "uuid",
  "progressPercent": 50,
  "status": "active",
  "total": 4,
  "completedLessons": [
    { "lessonId": "uuid", "completedAt": "..." }
  ]
}
```

`total` es la cantidad de lecciones del curso. `progressPercent` se recalcula automáticamente.

---

## Códigos de error relevantes

| Código | Status | Cuándo |
| ------ | ------ | ------ |
| `NOT_FOUND` | 404 | Curso, módulo, lección o inscripción no encontrada |
| `ALREADY_ENROLLED` | 409 | El estudiante ya está inscrito en ese curso |
| `ALREADY_COMPLETED` | 409 | La lección ya fue marcada como completada |
| `SLUG_TAKEN` | 409 | Ya existe un curso con ese slug |
| `FORBIDDEN` | 403 | El rol no tiene acceso a la ruta |
| `VALIDATION_ERROR` | 400 | Body o parámetros inválidos |
