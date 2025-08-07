require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testEmailConfiguration() {
  console.log('🧪 Probando configuración de correo...\n');

  // Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ No configurado');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ No configurado');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ No configurado');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Error: Configuración de correo incompleta');
    console.log('Por favor configura EMAIL_USER y EMAIL_PASS en el archivo .env');
    return;
  }

  try {
    // Verificar conexión
    console.log('🔍 Verificando conexión...');
    const connectionOk = await emailService.verifyConnection();
    
    if (!connectionOk) {
      console.log('❌ Error: No se pudo establecer conexión con el servidor de correo');
      return;
    }

    console.log('✅ Conexión establecida correctamente\n');

    // Enviar correo de prueba
    console.log('📧 Enviando correo de prueba...');
    
    const testEmail = process.env.EMAIL_USER; // Enviar a la misma cuenta
    const testToken = 'test-token-123456789';
    
    const result = await emailService.sendPasswordResetEmail(
      testEmail, 
      testToken, 
      'Usuario de Prueba'
    );

    if (result.success) {
      console.log('✅ Correo de prueba enviado exitosamente!');
      console.log('📨 Message ID:', result.messageId);
      console.log('📬 Enviado a:', testEmail);
      console.log('\n🎉 ¡La configuración de correo está funcionando correctamente!');
    } else {
      console.log('❌ Error enviando correo de prueba');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 Sugerencias:');
      console.log('1. Verifica que EMAIL_USER sea correcto');
      console.log('2. Verifica que EMAIL_PASS sea una contraseña de aplicación válida');
      console.log('3. Asegúrate de tener la autenticación de 2 factores activada en Gmail');
    }
  }
}

// Ejecutar la prueba
testEmailConfiguration();
