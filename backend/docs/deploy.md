# Deploy en Render + Neon

Guía para desplegar el backend en Render con PostgreSQL en Neon.
Tiempo estimado: 15-20 minutos la primera vez.

---

## Requisitos previos

- Código mergeado en `main`
- Cuenta en [Neon](https://neon.tech) con la base de datos creada
- Cuenta en [Render](https://render.com) con acceso al repositorio `Talently-Lab/SkillUp-s2607`

---

## 1. Configurar la base de datos en Neon

1. Crear un proyecto en Neon (o usar el existente).
2. En el dashboard de Neon, ir a **Connection Details** y copiar la **Connection string** en formato:
   ```
   postgres://usuario:password@host/database?sslmode=require
   ```
3. Aplicar las migraciones apuntando a Neon:
   ```bash
   # En local, con DATABASE_URL de Neon en el .env temporalmente
   DATABASE_URL=postgres://...neon... pnpm db:migrate
   ```
   > ⚠️ No dejar las credenciales de Neon en el .env local después de usarlas.

4. Crear el usuario admin inicial:
   ```bash
   DATABASE_URL=postgres://...neon... \
   SEED_ADMIN_EMAIL=admin@skillup.local \
   SEED_ADMIN_PASSWORD=<contraseña-segura> \
   SEED_ADMIN_NAME="Admin SkillUp" \
   pnpm db:seed:admin
   ```

---

## 2. Crear el Web Service en Render

1. Ir a [render.com](https://render.com) → **New** → **Web Service**
2. Conectar el repositorio `Talently-Lab/SkillUp-s2607`
3. Configurar:

   | Campo | Valor |
   | ----- | ----- |
   | **Name** | `skillup-campus-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install -g pnpm && pnpm install && pnpm build` |
   | **Start Command** | `pnpm start` |
   | **Node Version** | `24` (agregar variable `NODE_VERSION=24`) |

---

## 3. Variables de entorno en Render

Cargar en **Environment** → **Add Environment Variable**:

| Variable | Valor |
| -------- | ----- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render asigna el puerto; usar 10000 como default) |
| `LOG_LEVEL` | `info` |
| `DATABASE_URL` | Connection string de Neon (con `?sslmode=require`) |
| `CORS_ORIGIN` | URL del frontend en Vercel, ej: `https://skill-up-campus.vercel.app` |
| `TRUST_PROXY` | `1` (Render usa un proxy delante del servidor) |
| `JWT_ACCESS_SECRET` | Generar con: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `JWT_ACCESS_TTL_SECONDS` | `900` |
| `REFRESH_TOKEN_TTL_DAYS` | `7` |
| `DOCS_ENABLED` | `false` (deshabilitar Swagger en producción) |

> **No cargar** `SEED_ADMIN_*` en Render — esas variables son solo para el script local.

---

## 4. Verificar el deploy

Una vez deployado, verificar que el servidor responde:

```bash
curl https://<tu-app>.onrender.com/health
# Esperado: {"status":"ok"}
```

Si la BD está bien conectada, el health check devuelve `{"status":"ok"}`.

---

## 5. Configurar CORS_ORIGIN en Render

El frontend está en `https://skill-up-campus.vercel.app`. Si en el futuro se agrega un dominio
propio, agregar ambos separados por coma:

```
CORS_ORIGIN=https://skill-up-campus.vercel.app,https://skillup.com
```

---

## 6. Cookie cross-site (importante)

El frontend (`vercel.app`) y la API (`onrender.com`) están en dominios distintos. Esto afecta
la cookie `refresh_token` que usa `SameSite=Lax`.

**Opciones (decidir con el equipo antes del deploy final):**

1. **Proxy/rewrite en Vercel** (recomendada para el MVP): agregar en `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://<app>.onrender.com/api/:path*" }
     ]
   }
   ```
   Esto hace que el frontend llame a `/api/v1/...` y Vercel lo redirige al backend, manteniendo
   el mismo origen para la cookie.

2. **Subdominio compartido**: configurar `api.skillup.com` y `app.skillup.com` (requiere dominio propio).

3. **SameSite=None; Secure**: cambiar la configuración de la cookie en `auth.controller.ts` y
   agregar protección CSRF adicional.

---

## 7. Notas sobre el plan gratuito de Render

- El servidor "duerme" tras 15 minutos de inactividad.
- La primera request después del sleep tarda 30-60 segundos.
- Avisar al frontend para que muestre un indicador de carga en el login inicial.
- Si se necesita que el servidor no duerma, considerar el plan paid de Render.
