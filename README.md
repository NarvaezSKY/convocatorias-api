# 📋 Convocatorias API

API RESTful para la gestión integral de convocatorias, planes financieros y usuarios del sistema de Seguimiento de Innovación y Competitividad del SENA Regional Cauca.

## 📑 Tabla de Contenidos

- [Características](#-características)
- [Infraestructura](#️-infraestructura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Manual de Usuario](#-manual-de-usuario)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue](#-despliegue)

## ✨ Características

- 🔐 **Autenticación y Autorización**: Sistema JWT con roles de usuario (Superadmin, Admin, Dinamizador, Usuario, Líder Investigador)
- 📊 **Gestión de Convocatorias**: CRUD completo con filtros avanzados, búsqueda por año y relación muchos-a-muchos con usuarios
- 💰 **Planes Financieros**: Gestión de presupuestos y planes de ejecución asociados a convocatorias
- 📈 **Integración con Google Sheets**: Sincronización automática de datos con hojas de cálculo
- 📧 **Sistema de Notificaciones**: Envío de correos electrónicos para activación de cuentas y recuperación de contraseñas
- 📄 **Generación de Reportes**: Exportación de datos a Excel con análisis detallado
- 🔍 **Filtros Avanzados**: Búsqueda por múltiples criterios con regex e igualdad exacta
- 👥 **Relaciones Many-to-Many**: Asignación de múltiples usuarios a proyectos/convocatorias

## 🏗️ Infraestructura

### Stack Tecnológico

**Backend**
- **Node.js** (v18+): Entorno de ejecución
- **Express.js** (v5.1.0): Framework web
- **MongoDB** (v8): Base de datos NoSQL principal
- **Mongoose** (v8.14.3): ODM para MongoDB

**Autenticación & Seguridad**
- **JWT** (jsonwebtoken v9.0.2): Autenticación basada en tokens
- **bcryptjs** (v3.0.2): Encriptación de contraseñas

**Integraciones Externas**
- **Google Sheets API** (googleapis v149.0.0): Sincronización de datos
- **Nodemailer** (v7.0.3): Envío de correos electrónicos

**Utilidades**
- **ExcelJS** (v4.4.0): Generación de reportes Excel
- **Morgan** (v1.10.0): Logger HTTP
- **CORS** (v2.8.5): Control de acceso entre dominios
- **dotenv** (v16.5.0): Gestión de variables de entorno

**Herramientas de Desarrollo**
- **Nodemon** (v3.1.10): Recarga automática en desarrollo
- **ESLint** (v9.26.0): Linting de código

### Arquitectura

```
┌─────────────────┐
│   Frontend      │
│  (Vercel App)   │
└────────┬────────┘
         │ HTTP/HTTPS
         │ CORS Enabled
         ▼
┌─────────────────────────────────────┐
│         Express API Server          │
│  ┌─────────────────────────────┐   │
│  │   Middleware Layer          │   │
│  │  - CORS                     │   │
│  │  - Morgan (Logging)         │   │
│  │  - JWT Verification         │   │
│  │  - Role Authorization       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      API Routes             │   │
│  │  - /api/auth                │   │
│  │  - /api/convocatorias       │   │
│  │  - /api/plan-financiero     │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Business Logic Layer      │   │
│  │  - Controllers              │   │
│  │  - Services                 │   │
│  │  - Models (Mongoose)        │   │
│  └─────────────────────────────┘   │
└──────────┬──────────┬───────────────┘
           │          │
           ▼          ▼
    ┌──────────┐  ┌──────────────┐
    │ MongoDB  │  │ Google Sheets│
    │ Atlas    │  │     API      │
    └──────────┘  └──────────────┘
```

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **MongoDB Atlas** (cuenta y cluster configurado)
- **Google Cloud Console** (proyecto con Sheets API habilitado)
- **Servidor SMTP** (para envío de correos)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/NarvaezSKY/convocatorias-api.git
cd convocatorias-api
```

### 2. Instalar Dependencias

```bash
# Con npm
npm install

# Con yarn
yarn install
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Server Configuration
PORT=3000

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
TOKEN_EXPIRE=7d

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@convocatorias.com

# Google Sheets Configuration
SPREAD_SHEET_ID=your_google_sheet_id_here
SHEET_NAME=Convocatorias
SHEET_NAME_BENEFICIARIOS_MUNICIPIO=BeneficiariosPorMunicipio

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Role Tokens (for authorization)
SUPER_ADMIN_ROLE=superadmin
ADMIN_ROLE=admin
DINAMIZADOR_ROLE=dinamizador
USER_ROLE=usuario
LINVESTIGADOR_ROLE=linvestigador
```

### 4. Configurar Google Sheets API

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto o seleccionar uno existente
3. Habilitar Google Sheets API
4. Crear credenciales de cuenta de servicio
5. Descargar el archivo JSON de credenciales
6. Guardar el archivo como `convocatorias-460619-ffaa5974c73a.json` en la carpeta `credentials/`
7. Compartir tu Google Sheet con el email de la cuenta de servicio

## 🎯 Uso

### Modo Desarrollo

```bash
# Con npm
npm run dev

# Con yarn
yarn dev
```

El servidor se iniciará en `http://localhost:3000`

### Modo Producción

```bash
# Con npm
npm start

# Con yarn
yarn start
```

### Verificar Sintaxis y Linting

```bash
# Verificar sintaxis
npm run syntax-check

# Ejecutar linter
npm run lint

# Verificar todo
npm run check
```

## 📚 API Endpoints

### 🔐 Autenticación (`/api/auth`)

#### Registro y Login

| Método | Endpoint | Descripción | Autenticación | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/register/user` | Registrar nuevo usuario | No | Público |
| POST | `/login` | Iniciar sesión | No | Público |
| GET | `/verify` | Verificar token JWT | Sí | Todos |
| GET | `/profile` | Obtener perfil del usuario | Sí | Todos |

#### Gestión de Usuarios

| Método | Endpoint | Descripción | Autenticación | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/users` | Listar todos los usuarios | Sí | Superadmin, Dinamizador, Líder Investigador |
| GET | `/user/:id` | Obtener usuario por ID | Sí | Todos |
| GET | `/filter` | Filtrar usuarios | Sí | Todos |
| PATCH | `/update/:id` | Actualizar usuario | Sí | Todos |
| PATCH | `/update-role` | Actualizar rol de usuario | Sí | Superadmin, Dinamizador, Líder Investigador |
| PATCH | `/update-status` | Actualizar estado de usuario | Sí | Superadmin, Dinamizador, Líder Investigador |

#### Recuperación de Contraseña

| Método | Endpoint | Descripción | Autenticación | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/forgot-password` | Solicitar recuperación | No | Público |
| POST | `/reset-password` | Restablecer contraseña | No | Público |
| GET | `/activate/:token` | Activar cuenta | No | Público |

### 📊 Convocatorias (`/api/convocatorias`)

#### CRUD Básico

| Método | Endpoint | Descripción | Autenticación | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/get` | Listar todas las convocatorias | Sí | Todos |
| GET | `/get/:id` | Obtener convocatoria por ID | Sí | Todos los roles |
| POST | `/upload` | Crear nueva convocatoria | Sí | Todos los roles |
| PATCH | `/update/:id` | Actualizar convocatoria | Sí | Todos los roles |
| DELETE | `/delete/:id` | Eliminar convocatoria | Sí | Todos los roles |

#### Filtros y Búsqueda

| Método | Endpoint | Descripción | Ejemplo |
|--------|----------|-------------|---------|
| GET | `/filter` | Filtrar convocatorias | `?year=2025&nuevo_estado=Aprobado` |
| GET | `/filter?users=:userId` | Proyectos de un usuario | `?users=692dbae204b59a28a2b4fe8b` |
| GET | `/year/:year` | Convocatorias por año | `/year/2025` |
| GET | `/years/available` | Años disponibles | - |

#### Reportes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/filter?report=true` | Generar reporte Excel |

#### Gestión de Usuarios en Proyectos

| Método | Endpoint | Descripción | Body |
|--------|----------|-------------|------|
| POST | `/:id/users/add` | Agregar usuario a proyecto | `{ "userId": "..." }` |
| POST | `/:id/users/remove` | Remover usuario de proyecto | `{ "userId": "..." }` |

### 💰 Planes Financieros (`/api/plan-financiero`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/get/:id` | Obtener plan financiero | Sí |
| POST | `/create` | Crear plan financiero | Sí |
| PATCH | `/update/:id` | Actualizar plan financiero | Sí |

## 📖 Manual de Usuario

### Para Administradores

#### 1. Registro e Inicio de Sesión

**Registrar Usuario**
```bash
POST /api/auth/register/user
Content-Type: application/json

{
  "username": "Juan Pérez",
  "SENAemail": "juan.perez@sena.edu.co",
  "password": "password123",
  "telefono": "3001234567",
  "role": "usuario"
}
```

**Iniciar Sesión**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "SENAemail": "juan.perez@sena.edu.co",
  "password": "password123"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "Juan Pérez",
    "role": "usuario"
  }
}
```

#### 2. Gestión de Convocatorias

**Crear Convocatoria**
```bash
POST /api/convocatorias/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "convocatoria": "Innovación Tecnológica 2025",
  "consecutivo": "2025-001",
  "direccion_oficina_regional": "Cauca",
  "tipo_postulacion": "Interna",
  "nuevo_estado": "En revisión",
  "nombre": "Proyecto de IA para agricultura",
  "fecha_aprobacion": "2025-01-15",
  "fecha_inicio": "2025-02-01",
  "fecha_fin": "2025-12-31",
  "observaciones": "Proyecto prioritario",
  "url": "https://docs.google.com/...",
  "valor_solicitado": 50000000,
  "valor_aprobado": 45000000,
  "year": 2025
}
```

**Actualizar Convocatoria**
```bash
PATCH /api/convocatorias/update/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nuevo_estado": "Aprobado",
  "valor_aprobado": 48000000,
  "observaciones": "Aprobado con ajustes"
}
```

#### 3. Asignar Usuarios a Proyectos

**Agregar Usuario**
```bash
POST /api/convocatorias/:convocatoriaId/users/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "692dbae204b59a28a2b4fe8b"
}
```

**Remover Usuario**
```bash
POST /api/convocatorias/:convocatoriaId/users/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "692dbae204b59a28a2b4fe8b"
}
```

#### 4. Filtrar y Buscar

**Buscar por Año y Estado**
```bash
GET /api/convocatorias/filter?year=2025&nuevo_estado=Aprobado
Authorization: Bearer <token>
```

**Buscar Proyectos de un Usuario**
```bash
GET /api/convocatorias/filter?users=692dbae204b59a28a2b4fe8b
Authorization: Bearer <token>
```

**Buscar por Nombre (parcial)**
```bash
GET /api/convocatorias/filter?nombre=innovacion
Authorization: Bearer <token>
```

#### 5. Generar Reportes

**Exportar a Excel**
```bash
GET /api/convocatorias/filter?report=true&year=2025
Authorization: Bearer <token>
```

El reporte se descargará como archivo `.xlsx` con:
- Hoja 1: Lista de convocatorias
- Hoja 2: Plan financiero (si aplica)

### Para Usuarios

#### Consultar Mis Proyectos

```bash
GET /api/convocatorias/filter?users=<MI_USER_ID>
Authorization: Bearer <token>
```

#### Ver Detalles de Convocatoria

```bash
GET /api/convocatorias/get/:id
Authorization: Bearer <token>
```

#### Actualizar Mi Perfil

```bash
PATCH /api/auth/update/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "telefono": "3009876543",
  "areaDeTrabajo": "Desarrollo de Software",
  "centroDeFormacion": "Centro de Teleinformática y Producción Industrial"
}
```

## 🗂️ Estructura del Proyecto

```
convocatorias-api/
├── auth/                          # Módulo de autenticación
│   ├── controllers/               # Controladores de auth
│   ├── routes/                    # Rutas de auth
│   └── services/                  # Lógica de negocio auth
├── convocatorias/                 # Módulo de convocatorias
│   ├── controllers/               # Controladores
│   ├── routes/                    # Rutas
│   ├── services/                  # Lógica de negocio
│   └── sheets/                    # Integración Google Sheets
├── planFinanciero/                # Módulo de planes financieros
│   ├── controllers/
│   ├── routes/
│   └── services/
├── config/                        # Configuraciones
│   ├── config.js                  # Variables de entorno
│   ├── databaseCredentials.js     # Credenciales DB
│   └── token.js                   # Configuración JWT
├── credentials/                   # Credenciales Google API
│   └── convocatorias-*.json       # Service account JSON
├── database/                      # Configuración de BD
│   └── database.js                # Conexión MongoDB
├── libs/                          # Librerías compartidas
│   ├── jwt.js                     # Utilidades JWT
│   └── google/                    # Clientes Google API
├── models/                        # Modelos Mongoose
│   ├── User.js
│   ├── Convocatoria.js
│   ├── PlanFinanciero.js
│   └── PlanEjecucion.js
├── shared/                        # Recursos compartidos
│   └── middlewares/               # Middlewares
│       ├── verifyToken.js
│       └── verifyRole.js
├── utils/                         # Utilidades
│   └── generateActivationToken.js
├── app.js                         # Configuración Express
├── index.js                       # Punto de entrada
├── .env                           # Variables de entorno (no incluir en git)
├── .gitignore
├── package.json
├── vercel.json                    # Configuración Vercel
└── README.md
```

## 📜 Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev
yarn dev

# Producción
npm start
yarn start

# Verificar sintaxis
npm run syntax-check
yarn syntax-check

# Ejecutar linter
npm run lint
yarn lint

# Verificar todo (sintaxis + lint)
npm run check
yarn check
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Configurar variables de entorno en Vercel Dashboard

4. Desplegar:
```bash
vercel --prod
```

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de hosting:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- `SPREAD_SHEET_ID`, `SHEET_NAME`
- `FRONTEND_URL`
- Roles: `SUPER_ADMIN_ROLE`, `ADMIN_ROLE`, etc.

### Configuración de CORS

Actualizar en [app.js](app.js) los orígenes permitidos:

```javascript
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://tu-frontend.vercel.app"
  ],
  credentials: true,
};
```

## 🔒 Roles y Permisos

| Rol | Código | Permisos |
|-----|--------|----------|
| **Superadmin** | `superadmin` | Acceso total al sistema |
| **Admin** | `admin` | Gestión de convocatorias y usuarios |
| **Dinamizador** | `dinamizador` | Gestión de convocatorias, consulta de usuarios |
| **Usuario** | `usuario` | CRUD de convocatorias propias |
| **Líder Investigador** | `linvestigador` | Gestión de convocatorias y equipos |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

ISC

## 👥 Autores

- SENA Regional Cauca - Equipo de Innovación y Competitividad

## 📞 Soporte

Para soporte y consultas:
- Email: seguimientoidiregionalcauca@gmail.com
- Frontend: https://seguimiento-innovacion-y-competitividad.vercel.app

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
