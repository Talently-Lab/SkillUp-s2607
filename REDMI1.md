1. Lista de Preguntas para el Equipo (Brief)Antes de reunirte con tu equipo, es clave tener estas dudas anotadas para definir el rumbo del Backend. Te dejo una base de preguntas clave para lanzar:Autenticación y Roles: ¿Un usuario puede registrarse con múltiples roles (ej: ser estudiante y mentor a la vez)? ¿Usaremos login con Google/GitHub o solo correo y contraseña?Base de Datos: ¿Nuestros datos son muy estructurados y relacionales (PostgreSQL) o necesitamos flexibilidad para cambios rápidos de modelos (MongoDB)?Alcance del MVP (Mínimo Producto Viable): ¿Cuáles son los endpoints críticos e indispensables para que el Frontend pueda trabajar la próxima semana?📌 2. Archivo README.md Profesional (Listo para tu Portfolio)Este archivo debe vivir en la raíz de tu proyecto (fuera de la carpeta backend). Abre tu archivo README.md en tu editor y copia este contenido, adaptando los nombres de tu equipo:markdown# SkillUp Campus - Backend API 🚀

Este repositorio contiene la API REST para la plataforma SkillUp Campus, desarrollada para conectar áreas de tecnología, diseño, negocio y aseguramiento de calidad.

## 👥 Integrantes del Equipo
* **Backend Developer:** [Tu Nombre]
* **Frontend Developer:** [Nombre de tu compa]
* **Product Manager:** [Nombre de tu PM]
* **QA Engineer:** [Nombre de tu QA]

## 🛠️ Decisiones Técnicas (Stack)
* **Entorno de Ejecución:** Node.js
* **Framework:** Express.js (Arquitectura modular en carpetas)
* **Base de Datos:** *[Completar con PostgreSQL / MongoDB según lo que definan]*
* **Variables de Entorno:** Gestionadas con `dotenv`

## 🚀 Instrucciones de Instalación Local

Para que cualquier miembro del equipo (especialmente Frontend y QA) pueda levantar este servidor en su computadora, debe seguir estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com
   ```
2. **Instalar las dependencias:**
   Entra a la carpeta del servidor e instala los módulos necesarios:
   ```bash
   cd backend
   npm install
   ```
3. **Configurar Variables de Entorno:**
   Duplica el archivo `.env.example`, renombralo a `.env` y configura el puerto de escucha (por defecto `3000`):
   ```env
   PORT=3000
   ```
4. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```
Usa el código con precaución.📌 3. Backlog Técnico Inicial para tu Trello (Backend)Para completar tu tablero Kanban/Trello, crea estas tarjetas técnicas en la columna de Por Hacer (To Do). Puedes copiar y pegar estos títulos y descripciones directamente:📋 Tarjeta 1: Inicialización del Entorno Base de BackendDescripción: Configurar la estructura de carpetas src/, inicializar package.json, instalar dependencias base (express, dotenv, cors, nodemon) y crear el servidor "Hola Mundo" en index.js.📋 Tarjeta 2: Diseño y Conexión del Modelo de Base de DatosDescripción: Crear los esquemas/modelos iniciales para la base de datos (Colección/Tabla de Usuarios y Cursos) y realizar la conexión exitosa mediante variables de entorno.📋 Tarjeta 3: Endpoint de Registro y Login de UsuariosDescripción: Desarrollar las rutas y controladores para POST /api/auth/register y POST /api/auth/login. Incluir cifrado de contraseñas.📋 Tarjeta 4: CRUD Base de Cursos/ContenidoDescripción: Crear los endpoints para listar, crear, actualizar y eliminar cursos (GET, POST, PUT, DELETE en /api/courses).🚀 Tu Siguiente Paso Técnico en la Terminal:Para dejar el servidor funcionando con el comando npm run dev que pusimos en el README, hagamos el archivo inicial. Ejecuta esto en tu consola:bash# 1. Asegúrate de estar en la carpeta backend
cd backend

# 2. Crea el archivo index.js dentro de src
touch src/index.js
Usa el código con precaución.Abre backend/src/index.js en tu editor y pega este código base de prueba:javascriptimport express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
res.send('¡Servidor de SkillUp Campus funcionando con éxito! 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});