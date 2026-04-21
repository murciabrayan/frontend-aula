# Frontend Aula

Aplicación web del proyecto **Proyecto Aula - Gimnasio Los Cerros**, desarrollada con **React**, **TypeScript** y **Vite**.

Este frontend consume la API del backend institucional y cubre dos superficies principales:

- **Landing pública** del colegio.
- **Plataforma institucional** para administrador, docentes y estudiantes.

## Características

- Inicio de sesión con JWT.
- Integración con Google Sign-In.
- Primer acceso con cambio de contraseña y aceptación de tratamiento de datos.
- Panel administrativo para:
  - gestión de usuarios,
  - cursos y equipo,
  - estructura académica,
  - boletines,
  - asistencia,
  - permisos institucionales,
  - alertas académicas,
  - edición de landing.
- Panel docente para:
  - notas,
  - tareas,
  - asistencia,
  - alertas,
  - calendario,
  - perfil.
- Panel estudiante para:
  - tareas,
  - calificaciones,
  - asistencia,
  - permisos,
  - alertas,
  - perfil.
- Sistema de notificaciones internas.
- Loaders y feedback visual unificado.
- Exportación y visualización de documentos PDF.

## Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- FullCalendar
- Lucide React
- jsPDF
- pdfjs-dist

## Estructura principal

```text
src/
  api/          Clientes y endpoints HTTP
  commons/      Módulos por rol y autenticación
  components/   Componentes reutilizables y panel admin
  config/       Configuración de API y entorno
  context/      Loading global y feedback
  landing/      Landing pública y panel de edición
  services/     Servicios auxiliares
  utils/        Exportación PDF, imágenes y validaciones
```

## Requisitos

- Node.js 20+ recomendado
- npm 10+ recomendado

## Instalación

```bash
git clone https://github.com/murciabrayan/frontend-aula.git
cd frontend-aula
npm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz del frontend.

Variables principales:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

### Notas

- `VITE_API_URL` define la URL base del backend.
- Si no se define `VITE_API_URL`, en desarrollo se usa `http://127.0.0.1:8000`.
- `VITE_GOOGLE_CLIENT_ID` debe coincidir con la credencial OAuth configurada en Google Cloud Console.

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor local de desarrollo.

```bash
npm run build
```

Compila TypeScript y genera el build de producción.

```bash
npm run build:vercel
```

Build simplificado para despliegue en Vercel.

```bash
npm run preview
```

Sirve localmente la versión compilada.

```bash
npm run lint
```

Ejecuta validaciones de lint.

## Ejecución local

```bash
npm run dev
```

La aplicación quedará disponible normalmente en:

```text
http://localhost:5173
```

## Integración con backend

El frontend espera una API Django REST con endpoints como:

- `/api/token/`
- `/api/token/refresh/`
- `/api/auth/google/`
- `/api/profile/`
- `/api/courses/`
- `/api/assignments/`
- `/api/attendance/`
- `/api/report-cards/`
- `/api/permission-letters/`
- `/api/landing/`

## Despliegue

Este frontend fue preparado para **Vercel**.

### Variables recomendadas en producción

```env
VITE_API_URL=https://tu-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

### Dominio productivo

```text
https://www.tu-dominio.com
```

## Google OAuth

Si aparece el error `origin_mismatch`, revisa en Google Cloud Console:

```text
APIs y servicios > Credenciales > ID de cliente OAuth 2.0
```

Y agrega en **Orígenes autorizados de JavaScript**:

```text
https://www.tu-dominio.com
https://tu-dominio.com
http://localhost:5173
```

## Estado del proyecto

El frontend está conectado al backend productivo desplegado en Render y al dominio institucional configurado en Vercel.

## Repositorio relacionado

Backend:

```text
https://github.com/murciabrayan/Backend-Aula
```
