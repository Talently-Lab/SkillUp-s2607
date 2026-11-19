# SkillUp Campus - Frontend

## Herramientas

Como herramientas generales de desarrollo se usan:

- **React 19** para la interfaz.
- **React Router** para el enrutado.
- **Vite** para el entorno de desarrollo y el build.
- **TypeScript** para el tipado.
- **ESLint** para el linting del código.
- **Recharts** para los gráficos del panel del admin.
- **Zustand** para el estado global (la sesión del usuario).
- **Sonner** para los toasts.
- **ldrs** para el loader (`Spiral`), envuelto en `shared/components/Loader.tsx`.
- **Fontsource** para las fuentes: Inter (`@fontsource-variable/inter`) y Caveat (`@fontsource/caveat`).

Como manejador de paquetes se usa [**pnpm**](https://pnpm.io/es).

## Arquitectura

El frontend sigue una arquitectura de **modular monolith**: es una sola aplicación, pero el código está dividido en módulos por dominio. Cada módulo agrupa sus propias páginas y estilos, y lo que se comparte entre módulos vive en `shared`.

Actualmente el proyecto está estructurado así:

```
src/
├── assets/          # imágenes, íconos y recursos de marca
├── layouts/         # layouts de la app
│   ├── PublicLayout.tsx
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
├── modules/         # módulos por dominio
│   ├── home/        # landing page
│   ├── catalog/     # catálogo y detalle de cursos
│   ├── auth/        # inicio de sesión y registro
│   ├── student/     # panel del estudiante y vista de clases
│   ├── teacher/     # panel del docente
│   ├── admin/       # panel del admin
│   ├── legal/       # términos y condiciones, y política de privacidad
│   └── errors/      # página 404
├── shared/          # código compartido entre módulos
│   ├── components/  # componentes reutilizables (header, footer, course card, etc.)
│   ├── api/         # cliente HTTP (fetch) para hablar con la API
│   ├── constants/   # constantes compartidas
│   ├── hooks/       # hooks reutilizables
│   ├── mocks/       # datos de prueba para lo que la API todavía no cubre
│   ├── services/    # acceso a la API, un service por dominio
│   ├── stores/      # stores de zustand (sesión del usuario)
│   ├── types/       # tipos de TypeScript
│   └── utils/       # funciones utilitarias
├── App.tsx          # definición de rutas
├── main.tsx         # punto de entrada
└── index.css        # estilos globales
```

- **Rutas y `layouts`**:
  - `PublicLayout` envuelve las rutas públicas (`/`, `/catalog`, `/catalog/:slug`, `/terms`, `/privacy` y la página 404) y el panel del estudiante (`/student`), que conserva el header del sitio.
  - La vista de clases del estudiante (`/student/courses/:slug`) va sin layout, a pantalla completa.
  - `/login`, `/register` y `/admin/login` son las páginas de autenticación.
  - `DashboardLayout` se usa en el panel del admin (`/admin`) y en el del docente (`/teacher`). Tiene un sidebar en escritorio y una barra superior en móvil, y recibe los ítems de navegación por props (están en `modules/admin/constants/nav.ts` y `modules/teacher/constants/nav.ts`).
- **Sesión**: `useAuthStore` (`shared/stores/authStore.ts`) guarda el usuario y el access token **solo en memoria**. `authService` llama a los endpoints de `/auth` con el cliente de `shared/api/http.ts`, que envía la cookie del refresh token (`credentials: "include"`) y, si una request con `auth: true` responde `401 TOKEN_EXPIRED`, renueva la sesión y la reintenta. Si varias requests necesitan renovar la sesión al mismo tiempo, comparten un solo refresh. Al cargar la app se llama a `restoreSession` para recuperar la sesión. `/student`, `/teacher` y `/admin` están protegidas con `RequireAuth` según el rol. Los errores se muestran en un toast según el `code` de la API (`modules/auth/utils/authErrorMessage.ts`). El registro solo crea estudiantes y el login con Google todavía no existe en la API, así que su botón aparece deshabilitado con la etiqueta "Próximamente". Ver [`backend/docs/auth.md`](../backend/docs/auth.md).
- **Datos**: los services de `shared/services` consumen la API. Lo que la API todavía no cubre sale de `shared/mocks`: los usuarios del admin, los ingresos del resumen del admin, las reseñas y parte del contenido del detalle de curso.
- **Cursos del admin** (`/admin/courses`): `useAdminCourses` carga los cursos desde la API una sola vez y filtra y ordena en el cliente. Crear, editar y eliminar llaman al backend, y si falla se muestra el error de la API.
- **Usuarios del admin** (`/admin/users`): es la única sección del panel del admin que todavía no está conectada a la API. `useAdminUsers` arranca con las cuentas de `shared/mocks/adminUsers.ts` y guarda en estado local los cambios de rol y las suspensiones, así que se pierden al recargar. El admin con sesión iniciada no puede cambiar su propio rol ni suspenderse.
- **Panel del docente** (`/teacher`): `useTeacherDashboard` carga desde la API los cursos asignados al docente, sus métricas y el listado de estudiantes, y `useCourseSyllabus` permite editar los módulos y las clases de cada curso.
- **`modules`**: un módulo no debería importar de otro módulo. Si algo se necesita en más de uno, se mueve a `shared`.

## Cómo levantar el proyecto

1. Si no tenés pnpm instalado, andá a [https://pnpm.io/es](https://pnpm.io/es) y seguí los pasos de instalación.

2. Dentro de la carpeta `frontend`, instalá las dependencias:

   ```bash
   pnpm install
   ```

3. Levantá el backend (ver [`backend/README.md`](../backend/README.md)). Por defecto el frontend llama a `http://localhost:3000/api/v1`. Para usar otra URL, copiá `.env.example` a `.env.local` y cambiá `VITE_API_URL`. El origen del frontend (`http://localhost:5173`) tiene que estar en el `CORS_ORIGIN` del backend.

4. Ejecutá el entorno de desarrollo:

   ```bash
   pnpm dev
   ```

   La app queda en `http://localhost:5173`.

## Scripts

| Script         | Descripción                                   |
| -------------- | --------------------------------------------- |
| `pnpm dev`     | Servidor de desarrollo con recarga automática |
| `pnpm build`   | Revisa los tipos y genera el build en `dist/` |
| `pnpm preview` | Sirve el build de producción localmente       |
| `pnpm lint`    | Revisa el código con ESLint                   |
