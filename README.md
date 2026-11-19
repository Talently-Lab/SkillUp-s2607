# SkillUp Campus

SkillUp Campus es una plataforma de e-learning donde los estudiantes pueden inscribirse a cursos, avanzar por sus módulos clase a clase y seguir su progreso.

Este proyecto es un **MVP de 8 semanas**.

## Tipos de usuario

La plataforma tiene 3 tipos de usuario y cada uno tiene su propio panel:

- **Estudiante:** se inscribe a un curso, que está dividido en módulos, y marca cada clase como completada para seguir su progreso. Es el único rol que se puede crear desde el registro público.
- **Docente:** administra sus cursos asignados, pudiendo agregar o quitar módulos y clases, y sigue el avance de sus estudiantes.
- **Admin:** gestiona el contenido general de la plataforma y ve estadísticas como docentes y estudiantes, ingresos, estudiantes activos, cursos más vendidos, etc. Entra por `/admin/login`, un acceso interno sin registro ni login con Google.

## Alcance del MVP

Para estas 8 semanas entra:

- Panel del estudiante.
- Panel del docente.
- Panel del admin.
- Reportes básicos.

## Estructura del proyecto

- [`frontend/`](./frontend): aplicación web hecha con React y Vite.
- [`backend/`](./backend): API REST hecha con Express y PostgreSQL.

## Cómo empezar

1. Levantá el backend siguiendo [`backend/README.md`](./backend/README.md).
2. Levantá el frontend siguiendo [`frontend/README.md`](./frontend/README.md).
