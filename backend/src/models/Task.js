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
  try {
    // Verificar si es una nueva tarea y tiene usuarios asignados
    if (doc.assignedToIds && doc.assignedToIds.length > 0) {
      const Notification = require('./Notification');

      // Verificar si ya existen notificaciones para esta tarea
      const existingNotifications = await Notification.find({
        taskId: doc._id,
      });

      // Solo crear notificaciones si no existen ya
      if (existingNotifications.length === 0) {
        // Crear notificación para cada usuario asignado
        for (const userId of doc.assignedToIds) {
          try {
            await Notification.createTaskAssignedNotification(
              doc._id,
              userId,
              doc.title
            );
          } catch (notifError) {
            // Manejo de error para notificaciones individuales
          }
        }
      }
    }

    next();
  } catch (error) {
    next(); // No fallar la creación de la tarea por errores de notificación
  }
});

taskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
