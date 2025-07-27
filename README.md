# Sistema de Gestión de Tareas - Municipio Jaramijó

Sistema web de gestión de tareas basado en jerarquía organizativa para el Municipio de Jaramijó, desarrollado con tecnologías modernas y arquitectura escalable.

## 🚀 Características Principales

- **Gestión Jerárquica**: Sistema basado en direcciones y departamentos
- **Autenticación Segura**: JWT con tokens de acceso y refresh
- **Interfaz Moderna**: Angular 17 con Bootstrap 5 y diseño responsivo
- **API RESTful**: Backend robusto con Node.js y Express
- **Base de Datos**: MongoDB con Mongoose ODM
- **Subida de Archivos**: Soporte para PDF y XLSX hasta 10MB
- **Deployment**: Configurado para Vercel

## 🏗️ Arquitectura

### Frontend (Angular 17)

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/           # Servicios base, guards, interceptors
│   │   ├── features/       # Módulos de funcionalidades
│   │   │   ├── auth/       # Autenticación
│   │   │   ├── dashboard/  # Panel principal
│   │   │   ├── direcciones/# Gestión de direcciones
│   │   │   ├── departamentos/ # Gestión de departamentos
│   │   │   └── usuarios/   # Gestión de usuarios
│   │   └── shared/         # Componentes compartidos
│   └── assets/             # Recursos estáticos
```

### Backend (Node.js + Express)

```
backend/
├── src/
│   ├── controllers/        # Controladores de rutas
│   ├── middleware/         # Middleware personalizado
│   ├── models/            # Modelos de MongoDB
│   ├── routes/            # Definición de rutas
│   ├── services/          # Lógica de negocio
│   └── uploads/           # Archivos subidos
```

## 🛠️ Tecnologías

### Frontend

- **Angular 17** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Bootstrap 5.3.3** - Framework CSS
- **ng-bootstrap** - Componentes Angular para Bootstrap
- **Bootstrap Icons** - Iconografía

### Backend

- **Node.js 18+** - Runtime de JavaScript
- **Express 4.x** - Framework web
- **MongoDB 6+** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Multer** - Subida de archivos
- **CORS** - Manejo de CORS

## 📋 Requisitos Previos

- Node.js 18 o superior
- MongoDB 6 o superior
- npm o yarn
- Angular CLI 17

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone [url-del-repositorio]
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

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

### 4. Ejecutar en Desarrollo

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm start
```

La aplicación estará disponible en:

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## 📚 Modelos de Datos

### Direccion

```javascript
{
  nombre: String,
  descripcion: String,
  responsable: String,
  telefono: String,
  ubicacion: String,
  activo: Boolean
}
```

### Departamento

```javascript
{
  nombre: String,
  direccion: ObjectId,
  descripcion: String,
  responsable: String,
  telefono: String,
  activo: Boolean
}
```

### Usuario

```javascript
{
  nombres: String,
  apellidos: String,
  cedula: String,
  email: String,
  telefono: String,
  direccion: ObjectId,
  departamento: ObjectId,
  cargo: String,
  activo: Boolean
}
```

### Tarea

```javascript
{
  titulo: String,
  descripcion: String,
  estado: ['pendiente', 'en_progreso', 'completada', 'cancelada'],
  prioridad: ['baja', 'media', 'alta', 'urgente'],
  fechaInicio: Date,
  fechaVencimiento: Date,
  asignadoA: ObjectId,
  creadoPor: ObjectId,
  departamento: ObjectId,
  etiquetas: [String],
  archivos: [ObjectId]
}
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) con:

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido por 7 días
- **Interceptor HTTP**: Manejo automático de tokens
- **Guards**: Protección de rutas

### Roles del Sistema

- **Administrador**: Acceso completo al sistema
- **Supervisor**: Gestión de su dirección/departamento
- **Empleado**: Acceso a sus tareas asignadas

## 📱 Funcionalidades Implementadas

### ✅ Completadas

- [x] Autenticación y autorización
- [x] Dashboard principal con estadísticas
- [x] Gestión de direcciones (CRUD)
- [x] Gestión de departamentos (CRUD)
- [x] Gestión de usuarios (CRUD)
- [x] Navegación responsiva
- [x] Validación de formularios
- [x] Interceptores HTTP
- [x] Guards de rutas

### 🚧 En Desarrollo

- [ ] Gestión de tareas (CRUD)
- [ ] Sistema de roles y permisos
- [ ] Subida y gestión de archivos
- [ ] Notificaciones
- [ ] Reportes y estadísticas avanzadas
- [ ] Filtros y búsqueda avanzada

## 🚀 Deployment en Vercel

### Configuración Backend (Vercel Functions)

```json
{
  "functions": {
    "backend/src/app.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/backend/src/app.js"
    }
  ]
}
```

### Configuración Frontend

```json
{
  "outputPath": "dist/frontend",
  "index": "index.html",
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

## 📊 Scripts Disponibles

### Backend

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run test     # Ejecutar tests
```

### Frontend

```bash
npm start        # Desarrollo (ng serve)
npm run build    # Build para producción
npm run test     # Ejecutar tests
npm run lint     # Linting del código
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

- **Frontend**: Angular 17 + Bootstrap 5
- **Backend**: Node.js + Express + MongoDB
- **Deployment**: Vercel

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Desarrollado para el Municipio de Jaramijó** 🏛️
├── vercel.json # Configuración de despliegue
└── package.json # Scripts del proyecto raíz

````

## Despliegue en Vercel

1. Importar repositorio en Vercel
2. Configurar variables de entorno
3. Ejecutar `npm run build`
4. Desplegar backend como función serverless y frontend como sitio estático

## Variables de Entorno

- `MONGO_URI`: Conexión a MongoDB
- `JWT_SECRET`: Clave secreta para JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token
- `JWT_REFRESH_EXPIRES_IN`: Tiempo de expiración del refresh token
- `FRONT_ORIGIN`: Dominio del frontend para CORS

## Comandos Útiles

```bash
npm run install:all    # Instalar dependencias
npm run dev:backend    # Ejecutar backend en desarrollo
npm run dev:frontend   # Ejecutar frontend en desarrollo
npm run build          # Compilar para producción
````
