const User = require('../models/User');
const Task = require('../models/Task');

class NotificationService {
  async checkDueTasks() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Buscar tareas que vencen hoy
      const tasksDueToday = await Task.find({
        dueDate: {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $in: ['pending', 'in_progress'] },
      }).populate('assignedToIds', '_id');

      // Buscar tareas vencidas
      const overdueTasks = await Task.find({
        dueDate: { $lt: today },
        status: { $in: ['pending', 'in_progress'] },
      }).populate('assignedToIds', '_id');

      // Crear notificaciones para tareas que vencen hoy
      for (const task of tasksDueToday) {
        await this.createDueTodayNotifications(task);
      }

      // Crear notificaciones para tareas vencidas
      for (const task of overdueTasks) {
        await this.createOverdueNotifications(task);
      }

      console.log(
        `Verificación de tareas completada: ${tasksDueToday.length} tareas vencen hoy, ${overdueTasks.length} tareas vencidas`
      );
    } catch (error) {
      console.error('Error al verificar tareas vencidas:', error);
    }
  }

  async createDueTodayNotifications(task) {
    try {
      for (const user of task.assignedToIds) {
        // Verificar si ya existe una notificación similar
        const existingUser = await User.findById(user._id);
        const hasNotification = existingUser.notifications.some(
          (n) =>
            n.taskId.toString() === task._id.toString() &&
            n.type === 'task_due_today'
        );

        if (!hasNotification) {
          await User.findByIdAndUpdate(user._id, {
            $push: {
              notifications: {
                message: `La tarea "${task.title}" vence hoy`,
                taskId: task._id,
                type: 'task_due_today',
                read: false,
                createdAt: new Date(),
              },
            },
          });
        }
      }
    } catch (error) {
      console.error('Error al crear notificaciones de vencimiento:', error);
    }
  }

  async createOverdueNotifications(task) {
    try {
      for (const user of task.assignedToIds) {
        // Verificar si ya existe una notificación similar
        const existingUser = await User.findById(user._id);
        const hasNotification = existingUser.notifications.some(
          (n) =>
            n.taskId.toString() === task._id.toString() &&
            n.type === 'task_overdue'
        );

        if (!hasNotification) {
          await User.findByIdAndUpdate(user._id, {
            $push: {
              notifications: {
                message: `La tarea "${task.title}" está vencida`,
                taskId: task._id,
                type: 'task_overdue',
                read: false,
                createdAt: new Date(),
              },
            },
          });
        }
      }
    } catch (error) {
      console.error('Error al crear notificaciones de tareas vencidas:', error);
    }
  }

  startDueTasksChecker() {
    // Verificar cada hora
    setInterval(() => {
      this.checkDueTasks();
    }, 60 * 60 * 1000);

    // Ejecutar inmediatamente al iniciar
    this.checkDueTasks();
  }
}

module.exports = new NotificationService();
