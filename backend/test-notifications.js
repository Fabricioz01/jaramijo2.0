const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

// Importar modelos
require('./src/models/User');
require('./src/models/Task');
require('./src/models/Role');
require('./src/models/Permission');
require('./src/models/Departamento');
require('./src/models/Direccion');

const User = mongoose.model('User');
const Task = mongoose.model('Task');

async function createTestNotifications() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar el usuario específico
    const user = await User.findOne({ email: 'fabriciozavala13@gmail.com' });
    if (!user) {
      console.log('❌ No se encontró el usuario fabriciozavala13@gmail.com');
      // Buscar cualquier usuario
      const anyUser = await User.findOne({});
      if (!anyUser) {
        console.log('❌ No se encontró ningún usuario');
        return;
      }
      console.log('👤 Usando usuario encontrado:', anyUser.email);
      // Usar el primer usuario encontrado
      user = anyUser;
    } else {
      console.log('👤 Usuario objetivo encontrado:', user.email);
    }

    // Buscar la primera tarea o crear una de prueba
    let task = await Task.findOne({});
    if (!task) {
      console.log('📝 Creando tarea de prueba...');
      task = new Task({
        title: 'Tarea de prueba para notificaciones',
        description:
          'Esta es una tarea creada para probar el sistema de notificaciones',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        status: 'pending',
        departamentoId: user.departamentoId,
        direccionId: user.direccionId,
        assignedToIds: [user._id],
        createdBy: user._id,
      });
      await task.save();
      console.log('✅ Tarea de prueba creada:', task._id);
    }

    // Limpiar notificaciones existentes del usuario para esta tarea
    await User.updateOne(
      { _id: user._id },
      {
        $pull: {
          notifications: { taskId: task._id },
        },
      }
    );

    // Agregar notificaciones de prueba
    const testNotifications = [
      {
        message: `Se te ha asignado la tarea: ${task.title}`,
        taskId: task._id,
        type: 'task_assigned',
        read: false,
        createdAt: new Date(),
      },
      {
        message: `La tarea "${task.title}" vence pronto`,
        taskId: task._id,
        type: 'task_due_today',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
      },
    ];

    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          notifications: { $each: testNotifications },
        },
      }
    );

    console.log(
      '🔔 Notificaciones de prueba agregadas al usuario:',
      user.email
    );

    // Verificar que se agregaron correctamente
    const updatedUser = await User.findById(user._id);
    console.log(
      '📊 Total de notificaciones del usuario:',
      updatedUser.notifications.length
    );
    console.log('📋 Notificaciones agregadas:', testNotifications.length);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createTestNotifications();
