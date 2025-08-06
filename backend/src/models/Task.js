const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  dueDate: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'resolved'],
    required: false,
  },
  resolutionFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: false,
  },
  departamentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departamento',
    required: true,
  },
  assignedToIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  attachmentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: [],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para notificaciones automáticas
taskSchema.post('save', async function (doc, next) {
  console.log('🔔 [Task] Middleware post-save ejecutado para tarea:', doc._id);
  console.log('🔍 [Task] isNew:', this.isNew);
  console.log('🔍 [Task] assignedToIds:', doc.assignedToIds);
  console.log('🔍 [Task] assignedToIds length:', doc.assignedToIds?.length);

  try {
    // Verificar si es una nueva tarea y tiene usuarios asignados
    if (doc.assignedToIds && doc.assignedToIds.length > 0) {
      console.log('📨 [Task] Procesando notificaciones...');
      console.log(`   - Tarea: ${doc.title}`);
      console.log(`   - Usuarios asignados: ${doc.assignedToIds.length}`);

      const Notification = require('./Notification');
      console.log('📦 [Task] Modelo Notification cargado');

      // Verificar si ya existen notificaciones para esta tarea
      const existingNotifications = await Notification.find({
        taskId: doc._id,
      });
      console.log(
        `🔍 [Task] Notificaciones existentes: ${existingNotifications.length}`
      );

      // Solo crear notificaciones si no existen ya
      if (existingNotifications.length === 0) {
        console.log('✨ [Task] Creando nuevas notificaciones...');

        // Crear notificación para cada usuario asignado
        for (const userId of doc.assignedToIds) {
          try {
            console.log(
              `🎯 [Task] Creando notificación para usuario: ${userId}`
            );
            await Notification.createTaskAssignedNotification(
              doc._id,
              userId,
              doc.title
            );
            console.log(`✅ [Task] Notificación enviada al usuario: ${userId}`);
          } catch (notifError) {
            console.error(
              `❌ [Task] Error al enviar notificación al usuario ${userId}:`,
              notifError
            );
          }
        }
      } else {
        console.log(
          '⚠️ [Task] Ya existen notificaciones para esta tarea, omitiendo...'
        );
      }
    } else {
      console.log(
        'ℹ️ [Task] Tarea sin usuarios asignados, omitiendo notificaciones'
      );
      console.log('🔍 [Task] assignedToIds es:', doc.assignedToIds);
    }

    next();
  } catch (error) {
    console.error('❌ [Task] Error en middleware post-save:', error);
    next(); // No fallar la creación de la tarea por errores de notificación
  }
});

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
