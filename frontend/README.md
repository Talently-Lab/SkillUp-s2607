# SkillUp Campus - Frontend

## Herramientas

Como herramientas generales de desarrollo se usa:

- **React.js** para el renderizado UI.
- **React Router** para el enrutado.
- **Vite** para el entorno de desarrollo y el build.
- **TypeScript** para el tipado.
- **ESLint** para el linting del código.
- **Recharts** para los gráficos del panel del admin.
- **Zustand** para el estado global (la sesión del usuario).
- **Sonner** para los toasts.
- **ldrs** para el loader (`Spiral`), envuelto en `shared/components/Loader.tsx`.

Como manejador de paquetes se usa [**pnpm**](https://pnpm.io/es).

## Arquitectura

El frontend sigue una arquitectura de **modular monolith**: es una sola aplicación, pero el código está dividido en módulos por dominio. Cada módulo agrupa sus propias páginas y estilos, y lo que se comparte entre módulos vive en `shared`.

Actualmente el proyecto está estructurado así:

```
src/
├── assets/          # imágenes e íconos
├── layouts/         # layouts de la app
│   ├── PublicLayout.tsx
│   └── DashboardLayout.tsx
├── modules/         # módulos por dominio
│   ├── home/        # landing page
│   ├── catalog/     # catálogo de cursos
│   ├── auth/        # inicio de sesión y registro
│   ├── student/     # panel del estudiante
│   └── admin/       # panel del admin
├── shared/          # código compartido entre módulos
│   ├── components/  # componentes reutilizables (header, footer, course card, etc.)
│   ├── api/         # cliente HTTP (fetch) para hablar con la API
│   ├── hooks/       # hooks reutilizables
│   ├── mocks/       # datos de prueba
│   ├── services/    # acceso a datos (auth usa la API, el resto mocks)
│   ├── stores/      # stores de zustand (sesión del usuario)
│   ├── types/       # tipos de TypeScript
│   └── utils/       # funciones utilitarias
├── App.tsx          # definición de rutas
├── main.tsx         # punto de entrada
└── index.css        # estilos globales
```

- **`layouts`**: `PublicLayout` se usa en las rutas públicas (`/` y `/catalog`) y en el panel del estudiante (`/student`), que conserva el header del sitio. `DashboardLayout` se usa en el panel del admin (`/admin`): tiene un sidebar en escritorio y una barra superior en mobile, y recibe los ítems de navegación por props (los del admin están en `modules/admin/constants/nav.ts`).
- **Sesión**: `useAuthStore` (`shared/stores/authStore.ts`) guarda el usuario y el access token **solo en memoria**. `authService` llama a los endpoints de `/auth` con el cliente de `shared/api/http.ts`, que envía la cookie del refresh token (`credentials: "include"`) y, si una request con `auth: true` responde `401 TOKEN_EXPIRED`, renueva la sesión y la reintenta. Las renovaciones que coinciden comparten un solo refresh. Al cargar la app se llama a `restoreSession` para recuperar la sesión. `/student` y `/admin` están protegidas con `RequireAuth`. Los errores se muestran en un toast según el `code` de la API (`modules/auth/utils/authErrorMessage.ts`). El registro solo crea alumnos y el login con Google todavía no existe en la API, así que su botón muestra un aviso. Ver [`backend/docs/auth.md`](../backend/docs/auth.md).
- **Cursos del admin** (`/admin/courses`): `useAdminCourses` arranca con los cursos de `shared/mocks/courses.ts` y guarda en estado local los que se crean, editan o eliminan, así que los cambios se pierden al recargar. Cuando la API esté lista, solo hay que reemplazar ese estado por las llamadas al backend.
- **Usuarios del admin** (`/admin/users`): `useAdminUsers` arranca con las cuentas de `shared/mocks/adminUsers.ts` y guarda en estado local los cambios de rol y las suspensiones, así que también se pierden al recargar. El admin con sesión iniciada no puede cambiar su propio rol ni suspenderse.
- **`modules`**: un módulo no debería importar de otro módulo. Si algo se necesita en más de uno, se mueve a `shared`.

## Cómo levantar el proyecto

1. Si no tienes pnpm instalado, ve a [https://pnpm.io/es](https://pnpm.io/es) y sigue los pasos de instalación.

2. Dentro de la carpeta `frontend`, instala las dependencias:

   ```bash
   pnpm install
   ```

3. Levanta el backend (ver [`backend/README.md`](../backend/README.md)). Por defecto el frontend llama a `http://localhost:3000/api/v1`. Para usar otra URL, copia `.env.example` a `.env.local` y cambia `VITE_API_URL`. El origen del frontend (`http://localhost:5173`) debe estar en el `CORS_ORIGIN` del backend.

4. Ejecuta el entorno de desarrollo:

   ```bash
   pnpm dev
   ```
