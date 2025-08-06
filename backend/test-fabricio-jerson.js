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

async function testFabricioCreaTaskParaJerson() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar Fabricio y Jerson
    const fabricio = await User.findOne({
      email: 'fabriciozavala13@gmail.com',
    });
    const jerson = await User.findOne({ email: 'jcuenca@gmail.com' });
    const departamento = await Departamento.findOne();

    console.log('👨‍💼 Fabricio ID:', fabricio._id);
    console.log('👨‍💻 Jerson ID:', jerson._id);
    console.log('🏢 Departamento ID:', departamento._id);

    // Limpiar notificaciones anteriores de Jerson
    console.log('\n🧹 Limpiando notificaciones anteriores de Jerson...');
    await Notification.deleteMany({ userId: jerson._id });

    // Verificar estado inicial
    const notifsBefore = await Notification.find({ userId: jerson._id });
    console.log(`📊 Notificaciones de Jerson ANTES: ${notifsBefore.length}`);

    // Crear nueva tarea asignada a Jerson
    console.log('\n📝 Fabricio crea tarea para Jerson...');
    const newTask = new Task({
      title:
        'Tarea urgente de Fabricio para Jerson - ' +
        new Date().toLocaleString(),
      description: 'Esta tarea debe ser completada por Jerson lo antes posible',
      assignedToIds: [jerson._id],
      departamentoId: departamento._id,
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // En 2 días
    });

    console.log('💾 Guardando tarea...');
    const savedTask = await newTask.save();
    console.log('✅ Tarea creada:', savedTask._id);

    // Esperar que el middleware procese
    console.log('⏳ Esperando procesamiento...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verificar notificación creada
    console.log('\n🔍 Verificando notificación para Jerson...');
    const notifsAfter = await Notification.find({ userId: jerson._id })
      .populate('taskId', 'title description')
      .sort({ createdAt: -1 });

    console.log(`📊 Notificaciones de Jerson DESPUÉS: ${notifsAfter.length}`);

    if (notifsAfter.length > 0) {
      console.log('\n🎉 ¡NOTIFICACIÓN CREADA EXITOSAMENTE!');
      notifsAfter.forEach((notif, index) => {
        console.log(`  ${index + 1}. Título: ${notif.title}`);
        console.log(`     Mensaje: ${notif.message}`);
        console.log(`     Tarea: ${notif.taskId?.title}`);
        console.log(`     Tipo: ${notif.type}`);
        console.log(`     Leída: ${notif.read ? 'Sí' : 'No'}`);
        console.log(`     Fecha: ${notif.createdAt.toLocaleString()}`);
        console.log('');
      });

      console.log(
        '✅ FLUJO COMPLETO: Fabricio → Tarea → Jerson → Notificación ✅'
      );
    } else {
      console.log('❌ No se creó la notificación para Jerson');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

testFabricioCreaTaskParaJerson();
