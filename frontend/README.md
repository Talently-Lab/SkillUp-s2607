# SkillUp Campus - Frontend

## Herramientas

Como herramientas generales de desarrollo se usa:

- **React.js** para el renderizado UI.
- **React Router** para el enrutado.
- **Vite** para el entorno de desarrollo y el build.
- **TypeScript** para el tipado.
- **ESLint** para el linting del código.

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
│   ├── context/     # contextos globales (sesión del usuario)
│   ├── hooks/       # hooks reutilizables
│   ├── mocks/       # datos de prueba
│   ├── services/    # acceso a datos (hoy con mocks, luego la API)
│   ├── types/       # tipos de TypeScript
│   └── utils/       # funciones utilitarias
├── App.tsx          # definición de rutas
├── main.tsx         # punto de entrada
└── index.css        # estilos globales
```

- **`layouts`**: `PublicLayout` se usa en las rutas públicas (`/` y `/catalog`) y en el panel del estudiante (`/student`), que conserva el header del sitio. `DashboardLayout` se usa en el panel del admin (`/admin`).
- **Sesión**: `authService` inicia sesión con los usuarios de `shared/mocks/users.ts` (contraseña `skillup123`) y guarda la sesión en `localStorage`. Para integrar el backend solo hay que reemplazar los mocks de `authService` por las llamadas a la API. `/student` y `/admin` están protegidas con `RequireAuth`.
- **`modules`**: un módulo no debería importar de otro módulo. Si algo se necesita en más de uno, se mueve a `shared`.

## Cómo levantar el proyecto

1. Si no tienes pnpm instalado, ve a [https://pnpm.io/es](https://pnpm.io/es) y sigue los pasos de instalación.

2. Dentro de la carpeta `frontend`, instala las dependencias:

   ```bash
   pnpm install
   ```

3. Ejecuta el entorno de desarrollo:

   ```bash
   pnpm dev
   ```
