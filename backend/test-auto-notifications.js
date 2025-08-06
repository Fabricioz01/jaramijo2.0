require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
require('./src/models/User');
require('./src/models/Task');
require('./src/models/Departamento');
require('./src/models/Notification');

const User = mongoose.model('User');
const Task = mongoose.model('Task');
const Departamento = mongoose.model('Departamento');
const Notification = mongoose.model('Notification');

async function testNotificationSystem() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar un usuario para asignar la tarea
    console.log('🔍 Buscando usuario para prueba...');
    const testUser = await User.findOne({
      email: 'fabriciozavala13@gmail.com',
    });
    if (!testUser) {
      console.log('❌ Usuario de prueba no encontrado');
      return;
    }
    console.log('✅ Usuario encontrado:', testUser.email);

    // Buscar un departamento
    console.log('🔍 Buscando departamento...');
    const departamento = await Departamento.findOne();
    if (!departamento) {
      console.log('❌ Departamento no encontrado');
      return;
    }
    console.log('✅ Departamento encontrado:', departamento.name);

    // Eliminar notificaciones anteriores del modelo nuevo
    console.log('🧹 Limpiando notificaciones anteriores...');
    await Notification.deleteMany({ userId: testUser._id });
    console.log('✅ Notificaciones anteriores eliminadas');

    // Crear una nueva tarea (esto debería disparar automáticamente la notificación)
    console.log('📝 Creando tarea de prueba...');
    const newTask = new Task({
      title: 'Tarea de prueba automática - ' + new Date().toISOString(),
      description:
        'Esta es una tarea de prueba para verificar el sistema automático de notificaciones',
      assignedToIds: [testUser._id],
      departamentoId: departamento._id,
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
    });

    console.log('💾 Guardando tarea...');
    const savedTask = await newTask.save();
    console.log('✅ Tarea creada con ID:', savedTask._id);

    // Dar tiempo para que el middleware procese
    console.log('⏳ Esperando procesamiento de middleware...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verificar que se creó la notificación
    console.log('🔍 Verificando notificación creada...');
    const notifications = await Notification.find({ userId: testUser._id })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    console.log(`📊 Notificaciones encontradas: ${notifications.length}`);
    notifications.forEach((notif, index) => {
      console.log(
        `  ${index + 1}. ${notif.title} - ${notif.message} (${
          notif.read ? 'Leída' : 'No leída'
        })`
      );
    });

    if (notifications.length > 0) {
      console.log(
        '🎉 ¡Sistema de notificaciones automático funcionando correctamente!'
      );
    } else {
      console.log(
        '❌ No se encontraron notificaciones. Revisar el middleware.'
      );
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
  }
}

// Ejecutar la prueba
testNotificationSystem();
