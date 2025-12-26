## Front Ferretería (Vite + React + TS)

Frontend construido con **Vite**, **React 18** y **TypeScript**, usando **TailwindCSS** y componentes tipo **shadcn/ui**.

### Requisitos (Windows)

- **Git**: para clonar el repositorio.
- **Node.js (LTS recomendado)**: idealmente **Node 18+** (o 20+).
  - Incluye **npm** (suficiente para este proyecto).
- (Opcional) **pnpm** o **yarn**: si prefieres otro gestor de paquetes.

### Instalación del proyecto

En PowerShell, desde la raíz del repo:

```bash
npm install
```

### Variables de entorno

Este frontend consume un backend REST. Por defecto apunta a:

- `http://localhost:8000/api/v1`

Para cambiarlo sin tocar código:

1) Copia `env.example` a `.env`:

```bash
copy env.example .env
```

2) Edita `.env` y ajusta:

- **`VITE_API_BASE_URL`**: URL base del backend (incluyendo `/api/v1` si aplica)

Ejemplo:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### (Opcional) Evitar CORS en desarrollo con proxy de Vite

Si tu backend no tiene CORS habilitado aún, puedes evitarlo en **desarrollo** usando el proxy de Vite.

1) En tu `.env`, define:

```bash
VITE_API_BASE_URL=/api/v1
```

2) Arranca el frontend con `npm run dev`. Vite reenviará las llamadas `/api/*` a `http://localhost:8000`.

### Correr en local (desarrollo)

1) Asegúrate de tener el **backend levantado** y accesible desde el navegador.
   - Endpoints esperados (ejemplos): `/auth/login`, `/auth/refresh-token`, `/users/me`, `/users`, `/roles`.
   - Si ves errores de CORS, configura el backend para permitir el origen `http://localhost:5173`.

2) Levanta el frontend:

```bash
npm run dev
```

Abre:

- `http://localhost:5173`

### Scripts disponibles

- **`npm run dev`**: servidor de desarrollo.
- **`npm run build`**: build de producción.
- **`npm run build:dev`**: build en modo development.
- **`npm run preview`**: previsualizar el build (levanta un servidor local).
- **`npm run lint`**: ESLint.

### Notas útiles

- **Alias `@/`**: el proyecto usa imports tipo `@/components/...` (resuelto a `src/`).
- **Auth**: los tokens se guardan en `localStorage` (`access_token` y `refresh_token`).

### Estructura rápida

- `src/pages/`: pantallas (Login, Dashboard, Usuarios, etc.)
- `src/services/`: llamadas al backend
- `src/contexts/`: contexto de autenticación
- `src/components/ui/`: componentes UI


