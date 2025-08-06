require('dotenv').config();
const axios = require('axios');

async function testNotificationAPI() {
  try {
    console.log('🔑 Haciendo login para obtener token...');

    // 1. Login para obtener token
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'fabriciozavala13@gmail.com',
        password: '123456',
      }
    );

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido');

    // 2. Probar endpoint de notificaciones
    console.log('🔔 Probando endpoint de notificaciones...');
    const notificationsResponse = await axios.get(
      'http://localhost:3000/api/v1/notifications',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Respuesta del endpoint de notificaciones:');
    console.log('📊 Status:', notificationsResponse.status);
    console.log('📊 Success:', notificationsResponse.data.success);
    console.log('📊 Count:', notificationsResponse.data.count);
    console.log('📊 Notificaciones:');

    notificationsResponse.data.data.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.title}`);
      console.log(`     - Mensaje: ${notif.message}`);
      console.log(`     - Tipo: ${notif.type}`);
      console.log(`     - Leída: ${notif.read ? 'Sí' : 'No'}`);
      console.log(
        `     - Fecha: ${new Date(notif.createdAt).toLocaleString()}`
      );
      if (notif.taskId) {
        console.log(`     - Tarea: ${notif.taskId.title || notif.taskId}`);
      }
      console.log('');
    });

    // 3. Probar conteo de no leídas
    console.log('🔢 Probando conteo de no leídas...');
    const unreadCountResponse = await axios.get(
      'http://localhost:3000/api/v1/notifications/unread-count',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Conteo de no leídas:', unreadCountResponse.data.count);
  } catch (error) {
    console.error(
      '❌ Error en la prueba:',
      error.response?.data || error.message
    );
  }
}

testNotificationAPI();
