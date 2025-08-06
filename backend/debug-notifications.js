require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
require('./src/models/User');
require('./src/models/Task');
require('./src/models/Notification');

const User = mongoose.model('User');
const Notification = mongoose.model('Notification');

async function debugNotifications() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Listar todos los usuarios
    console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
    const users = await User.find({}, 'name email _id').sort({ email: 1 });
    users.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`
      );
    });

    // Listar todas las notificaciones
    console.log('\n🔔 NOTIFICACIONES EN LA BASE DE DATOS:');
    const notifications = await Notification.find({})
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    if (notifications.length === 0) {
      console.log('  ❌ No hay notificaciones en la base de datos');
    } else {
      notifications.forEach((notif, index) => {
        console.log(
          `  ${index + 1}. Para: ${notif.userId?.name} (${notif.userId?.email})`
        );
        console.log(`     - Título: ${notif.title}`);
        console.log(`     - Mensaje: ${notif.message}`);
        console.log(`     - Tarea: ${notif.taskId?.title || 'Sin tarea'}`);
        console.log(`     - Leída: ${notif.read ? 'Sí' : 'No'}`);
        console.log(`     - Fecha: ${notif.createdAt}`);
        console.log(`     - Usuario ID: ${notif.userId?._id}`);
        console.log('');
      });
    }

    // Buscar específicamente el usuario fabricio
    console.log('\n🔍 BUSCANDO USUARIO FABRICIO:');
    const fabricio = await User.findOne({
      $or: [{ email: /fabricio/i }, { name: /fabricio/i }],
    });

    if (fabricio) {
      console.log(
        `✅ Fabricio encontrado: ${fabricio.name} (${fabricio.email}) - ID: ${fabricio._id}`
      );

      const fabricioNotifications = await Notification.find({
        userId: fabricio._id,
      })
        .populate('taskId', 'title')
        .sort({ createdAt: -1 });

      console.log(
        `📊 Notificaciones de Fabricio: ${fabricioNotifications.length}`
      );
    } else {
      console.log('❌ Usuario Fabricio no encontrado');
    }

    // Buscar específicamente el usuario jerson
    console.log('\n🔍 BUSCANDO USUARIO JERSON:');
    const jerson = await User.findOne({
      $or: [{ email: /jerson/i }, { name: /jerson/i }],
    });

    if (jerson) {
      console.log(
        `✅ Jerson encontrado: ${jerson.name} (${jerson.email}) - ID: ${jerson._id}`
      );

      const jersonNotifications = await Notification.find({
        userId: jerson._id,
      })
        .populate('taskId', 'title')
        .sort({ createdAt: -1 });

      console.log(`📊 Notificaciones de Jerson: ${jersonNotifications.length}`);
    } else {
      console.log('❌ Usuario Jerson no encontrado');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

debugNotifications();
