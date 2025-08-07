const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // jaramijo@municipio.gob.ec o el correo institucional
        pass: process.env.EMAIL_PASS, // password de aplicación de Gmail
      },
    });
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: 'Sistema de Gestión - Municipio Jaramijó',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Recuperación de Contraseña - Sistema de Gestión',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de Contraseña</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
                border: 1px solid #dee2e6;
              }
              .btn {
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .warning {
                background: #fff3cd;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏛️ Municipio de Jaramijó</h1>
              <h2>Sistema de Gestión de Tareas</h2>
            </div>
            
            <div class="content">
              <h3>Hola ${userName},</h3>
              
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el Sistema de Gestión de Tareas del Municipio de Jaramijó.</p>
              
              <p>Si realizaste esta solicitud, haz clic en el siguiente botón para crear una nueva contraseña:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">Restablecer Contraseña</a>
              </div>
              
              <p>O copia y pega el siguiente enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace es válido por <strong>1 hora</strong></li>
                  <li>Solo puede usarse una vez</li>
                  <li>Si no solicitaste este cambio, ignora este correo</li>
                </ul>
              </div>
              
              <p>Si tienes problemas con el enlace, contacta al administrador del sistema.</p>
              
              <p>Saludos cordiales,<br>
              <strong>Equipo de TI - Municipio de Jaramijó</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>© ${new Date().getFullYear()} Municipio de Jaramijó - Sistema de Gestión de Tareas</p>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Correo de recuperación enviado:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  async sendPasswordChangedNotification(email, userName) {
    try {
      const mailOptions = {
        from: {
          name: 'Sistema de Gestión - Municipio Jaramijó',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Contraseña Actualizada - Sistema de Gestión',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Contraseña Actualizada</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
                border: 1px solid #dee2e6;
              }
              .success {
                background: #d4edda;
                color: #155724;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #28a745;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
                color: #6c757d;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔒 Contraseña Actualizada</h1>
            </div>
            
            <div class="content">
              <h3>Hola ${userName},</h3>
              
              <div class="success">
                <strong>✅ ¡Éxito!</strong> Tu contraseña ha sido actualizada correctamente.
              </div>
              
              <p>Tu contraseña para el Sistema de Gestión de Tareas del Municipio de Jaramijó ha sido cambiada exitosamente el <strong>${new Date().toLocaleString('es-ES', { timeZone: 'America/Guayaquil' })}</strong>.</p>
              
              <p>Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.</p>
              
              <p>Ahora puedes acceder al sistema con tu nueva contraseña.</p>
              
              <p>Saludos cordiales,<br>
              <strong>Equipo de TI - Municipio de Jaramijó</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>© ${new Date().getFullYear()} Municipio de Jaramijó - Sistema de Gestión de Tareas</p>
            </div>
          </body>
          </html>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Notificación de cambio de contraseña enviada:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      // No lanzamos error aquí porque el cambio de contraseña ya se realizó
      return { success: false, error: error.message };
    }
  }

  // Método para verificar la configuración del correo
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión de correo verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error en la configuración de correo:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
