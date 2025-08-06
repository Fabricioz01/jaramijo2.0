const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'task_assigned',
      'task_due_today',
      'task_overdue',
      'task_completed',
      'task_updated',
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  readAt: {
    type: Date,
    required: false,
  },
});

// Índice compuesto para consultas eficientes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Método estático para crear notificación de tarea asignada
notificationSchema.statics.createTaskAssignedNotification = async function (
  taskId,
  userId,
  taskTitle
) {
  console.log('📩 [Notification] Creando notificación de tarea asignada');
  console.log(`   - Usuario: ${userId}`);
  console.log(`   - Tarea: ${taskTitle}`);

  try {
    const notification = new this({
      userId: userId,
      type: 'task_assigned',
      title: 'Nueva tarea asignada',
      message: `Se te ha asignado la tarea: ${taskTitle}`,
      taskId: taskId,
      read: false,
    });

    const savedNotification = await notification.save();
    console.log(
      '✅ [Notification] Notificación creada exitosamente:',
      savedNotification._id
    );
    return savedNotification;
  } catch (error) {
    console.error('❌ [Notification] Error al crear notificación:', error);
    throw error;
  }
};

// Método estático para marcar como leída
notificationSchema.statics.markAsRead = async function (notificationId) {
  console.log(
    '📖 [Notification] Marcando notificación como leída:',
    notificationId
  );

  try {
    const result = await this.findByIdAndUpdate(
      notificationId,
      {
        read: true,
        readAt: new Date(),
      },
      { new: true }
    );

    console.log('✅ [Notification] Notificación marcada como leída');
    return result;
  } catch (error) {
    console.error('❌ [Notification] Error al marcar como leída:', error);
    throw error;
  }
};

// Método estático para obtener notificaciones de un usuario
notificationSchema.statics.getByUserId = async function (userId, options = {}) {
  console.log(
    '🔍 [Notification] Obteniendo notificaciones para usuario:',
    userId
  );

  const { limit = 20, skip = 0, unreadOnly = false } = options;

  try {
    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await this.find(query)
      .populate('taskId', 'title status dueDate')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    console.log(
      `✅ [Notification] ${notifications.length} notificaciones encontradas`
    );
    return notifications;
  } catch (error) {
    console.error('❌ [Notification] Error al obtener notificaciones:', error);
    throw error;
  }
};

module.exports = mongoose.model('Notification', notificationSchema);
