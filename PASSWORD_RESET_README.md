# 📧 Sistema de Recuperación de Contraseña

## 🎯 Funcionalidades Implementadas

✅ **Solicitud de recuperación**: Los usuarios pueden solicitar restablecer su contraseña  
✅ **Envío de correos**: Sistema automático de envío de correos con enlaces seguros  
✅ **Validación de tokens**: Tokens únicos con expiración de 1 hora  
✅ **Restablecimiento seguro**: Formulario para crear nueva contraseña  
✅ **Interfaz intuitiva**: Componentes responsivos con Bootstrap e iconos  
✅ **Notificaciones**: Correos de confirmación después del cambio  

## 🔧 Configuración Requerida

### 1. Configurar Correo Electrónico

En el archivo `backend/.env`, necesitas configurar:

```env
# Configuración de correo electrónico
EMAIL_USER=tu-correo@municipio-jaramijo.gob.ec
EMAIL_PASS=tu-password-de-aplicacion
FRONTEND_URL=http://localhost:4200
```

### 2. Configurar Gmail (Recomendado)

Si usas Gmail institucional:

1. **Activar autenticación de 2 factores** en la cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ve a: https://myaccount.google.com/security
   - Autenticación en 2 pasos → Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro" → Escribe "Sistema Municipal"
   - Copia la contraseña de 16 dígitos generada

3. **Configurar el .env**:
```env
EMAIL_USER=sistema@municipio-jaramijo.gob.ec
EMAIL_PASS=abcd efgh ijkl mnop  # La contraseña de aplicación
FRONTEND_URL=http://localhost:4200
```

### 3. Configurar Otro Proveedor de Correo

Si no usas Gmail, modifica `backend/src/services/emailService.js`:

```javascript
// Para Outlook/Hotmail
this.transporter = nodemailer.createTransporter({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Para servidor SMTP personalizado
this.transporter = nodemailer.createTransporter({
  host: 'smtp.tu-servidor.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🚀 Cómo Usar

### Para Usuarios

1. **Olvidé mi contraseña**:
   - Ir a la página de login
   - Hacer clic en "¿Olvidaste tu contraseña?"
   - Ingresar el correo electrónico
   - Revisar el correo y seguir las instrucciones

2. **Restablecer contraseña**:
   - Hacer clic en el enlace del correo
   - Ingresar la nueva contraseña (mínimo 6 caracteres)
   - Confirmar la contraseña
   - ¡Listo! Ya puedes iniciar sesión

### Para Administradores

1. **Verificar configuración**:
```bash
cd backend
node -e "
const emailService = require('./src/services/emailService');
emailService.verifyConnection().then(result => {
  console.log('Configuración de correo:', result ? '✅ OK' : '❌ Error');
});
"
```

2. **Probar envío**:
```bash
# En el backend, puedes crear un script de prueba
node test-email.js
```

## 🛡️ Seguridad

- **Tokens únicos**: Cada solicitud genera un token criptográficamente seguro
- **Expiración**: Los tokens expiran en 1 hora
- **Un solo uso**: Los tokens se invalidan después de usarse
- **No exposición de datos**: No se revela si un email existe en el sistema
- **Validación robusta**: Validaciones tanto en frontend como backend

## 📁 Archivos Modificados/Creados

### Backend
```
backend/
├── src/
│   ├── models/User.js                     # ✏️ Agregados campos de reset
│   ├── services/emailService.js           # 🆕 Servicio de correo
│   ├── services/userService.js            # ✏️ Métodos de recuperación
│   ├── controllers/authController.js      # ✏️ Controladores de reset
│   ├── routes/authRoutes.js              # ✏️ Rutas de recuperación
│   └── utils/validations.js              # ✏️ Validaciones
├── .env                                   # ✏️ Variables de correo
└── package.json                          # ✏️ Dependencia nodemailer
```

### Frontend
```
frontend/src/app/
├── core/
│   ├── models/password-reset.model.ts     # 🆕 Modelos de tipos
│   ├── models/index.ts                    # ✏️ Export de modelos
│   └── services/auth.service.ts           # ✏️ Métodos de recuperación
├── features/auth/
│   ├── forgot-password/                   # 🆕 Componente solicitud
│   ├── reset-password/                    # 🆕 Componente reset
│   └── login/                            # ✏️ Enlace "olvidé contraseña"
└── app.routes.ts                         # ✏️ Rutas nuevas
```

## 🌐 URLs Disponibles

- **Login**: `/login`
- **Solicitar recuperación**: `/forgot-password`
- **Restablecer**: `/reset-password?token=XXXXX`

## 🎨 Características de la UI

- **Responsive**: Funciona en móvil, tablet y desktop
- **Bootstrap 5**: Diseño moderno y consistente
- **Bootstrap Icons**: Iconografía clara
- **Animaciones**: Transiciones suaves
- **Feedback visual**: Estados de carga, éxito y error
- **Validación en tiempo real**: Feedback inmediato
- **Indicador de seguridad**: Medidor de fortaleza de contraseña

## 🔍 Troubleshooting

### Error: "Error al enviar el correo"
- Verificar credenciales en `.env`
- Comprobar que la autenticación de 2 factores esté activada
- Verificar que la contraseña de aplicación sea correcta

### Error: "Token inválido o expirado"
- El enlace puede haber expirado (1 hora)
- El enlace ya fue usado
- Solicitar un nuevo enlace

### Error: "Could not find template file"
- Asegurarse de que todos los archivos fueron creados
- Verificar que la estructura de carpetas sea correcta

## 🚦 Estados del Sistema

El sistema maneja los siguientes estados:

1. **Solicitud enviada**: Correo enviado exitosamente
2. **Token verificado**: Enlace válido, mostrar formulario
3. **Token inválido**: Mostrar error y opciones
4. **Contraseña actualizada**: Éxito, redirigir a login
5. **Error en proceso**: Mostrar mensaje de error específico

---

## 📞 Soporte

Si necesitas ayuda con la configuración:

1. Verifica que todas las dependencias estén instaladas
2. Revisa los logs del servidor para errores específicos
3. Prueba la conexión de correo por separado
4. Verifica que las URLs del frontend coincidan con la configuración
