# Sistema de Gestión de Tareas - Municipio Jaramijó

Este proyecto es un sistema web diseñado para gestionar tareas y roles en el Municipio de Jaramijó. Está construido con tecnologías modernas y sigue una arquitectura escalable.

## 🚀 Características Principales

- **Gestión Jerárquica**: Basado en direcciones y departamentos.
- **Autenticación Segura**: Uso de JWT para tokens de acceso y refresh.
- **Interfaz Moderna**: Angular 17 con Bootstrap 5.
- **API RESTful**: Backend robusto con Node.js y Express.
- **Base de Datos**: MongoDB con Mongoose ODM.
- **Subida de Archivos**: Soporte para PDF y XLSX.

## 🏗️ Arquitectura del Proyecto

### Frontend (Angular 17)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Servicios base, guards, interceptors
│   │   ├── features/       # Módulos de funcionalidades
│   │   └── shared/         # Componentes compartidos
│   └── assets/             # Recursos estáticos
```

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/        # Controladores de rutas
│   ├── middlewares/        # Middleware personalizado
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Definición de rutas
│   ├── services/           # Lógica de negocio
│   └── utils/              # Utilidades
```

## 📋 Requisitos Previos

- Node.js 18 o superior
- MongoDB 6 o superior
- npm o yarn
- Angular CLI 17

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone [poner url del repo mas tarde]
cd municipio-jaramijo
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Editar .env con tus configuraciones
```

**Configuración del archivo .env:**

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/municipio_jaramijo
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_muy_seguro
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

**Ejecutar el backend:**

```bash
npm run start
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

**Ejecutar el frontend:**

```bash
npm start
```

La aplicación estará disponible en:

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## 📚 Descripción de las Partes Clave

### Backend

- **Controladores**: Manejan la lógica de las rutas (e.g., `authController.js`, `roleController.js`).
- **Middlewares**: Validaciones y manejo de errores (e.g., `authJwt.js`, `errorHandler.js`).
- **Modelos**: Definición de esquemas de MongoDB (e.g., `User.js`, `Role.js`).
- **Rutas**: Definición de endpoints (e.g., `authRoutes.js`, `roleRoutes.js`).
- **Servicios**: Contienen la lógica de negocio (e.g., `authService.js`, `roleService.js`).

### Frontend

- **Core**: Servicios base, guards e interceptors.
- **Features**: Módulos específicos como `roles`, `usuarios`, `tareas`.
- **Shared**: Componentes reutilizables y módulos compartidos.

## 📊 Scripts Disponibles

### Backend

```bash
npm run start      # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
```

### Frontend

```bash
npm start          # Iniciar en desarrollo
npm run build      # Compilar para producción
```

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado para el Municipio de Jaramijó** 🏛️
