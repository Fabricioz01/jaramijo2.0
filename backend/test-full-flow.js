require('dotenv').config();
const axios = require('axios');

async function testFullFlow() {
  try {
    console.log('🔑 Login como Fabricio...');
    const fabricioLogin = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'fabriciozavala13@gmail.com',
        password: '123456',
      }
    );
    const fabricioToken = fabricioLogin.data.data.token;
    console.log('✅ Fabricio logueado');

    console.log('🔑 Login como Jerson...');
    const jersonLogin = await axios.post(
      'http://localhost:3000/api/v1/auth/login',
      {
        email: 'jcuenca@gmail.com',
        password: '12345678',
      }
    );
    const jersonToken = jersonLogin.data.data.token;
    console.log('✅ Jerson logueado');

    // Probar notificaciones de Fabricio (debe tener 1)
    console.log('\n🔔 Probando notificaciones de Fabricio...');
    try {
      const fabricioNotifs = await axios.get(
        'http://localhost:3000/api/v1/notifications',
        {
          headers: { Authorization: `Bearer ${fabricioToken}` },
        }
      );
      console.log('✅ Notificaciones de Fabricio:', fabricioNotifs.data.count);
      fabricioNotifs.data.data.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.message}`);
      });
    } catch (error) {
      console.error(
        '❌ Error notificaciones Fabricio:',
        error.response?.data || error.message
      );
    }

    // Probar notificaciones de Jerson (debe tener 0)
    console.log('\n🔔 Probando notificaciones de Jerson...');
    try {
      const jersonNotifs = await axios.get(
        'http://localhost:3000/api/v1/notifications',
        {
          headers: { Authorization: `Bearer ${jersonToken}` },
        }
      );
      console.log('✅ Notificaciones de Jerson:', jersonNotifs.data.count);
      jersonNotifs.data.data.forEach((notif, index) => {
        console.log(`  ${index + 1}. ${notif.title} - ${notif.message}`);
      });
    } catch (error) {
      console.error(
        '❌ Error notificaciones Jerson:',
        error.response?.data || error.message
      );
    }
  } catch (error) {
    console.error(
      '❌ Error en la prueba:',
      error.response?.data || error.message
    );
  }
}

testFullFlow();
