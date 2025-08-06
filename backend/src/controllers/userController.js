const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const user = await userService.create(req.body);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();

      res.json({
        message: 'Usuarios obtenidos exitosamente',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);

      res.json({
        message: 'Usuario obtenido exitosamente',
        data: user,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const user = await userService.update(req.params.id, req.body);

      res.json({
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);

      res.json({
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const user = await userService.toggleActive(req.params.id);

      res.json({
        message: `Usuario ${
          user.active ? 'activado' : 'desactivado'
        } exitosamente`,
        data: user,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async getNotifications(req, res, next) {
    try {
      const userId = req.user._id;
      const user = await userService.getById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      // Poblar las notificaciones con información de la tarea
      await user.populate({
        path: 'notifications.taskId',
        select: 'title description dueDate status',
      });

      // Filtrar notificaciones que tienen tareas válidas
      const validNotifications = user.notifications.filter(
        (notification) => notification.taskId
      );

      const notifications = validNotifications.map((notification) => ({
        _id: notification._id,
        message: notification.message,
        taskId: notification.taskId._id,
        read: notification.read,
        type: notification.type,
        createdAt: notification.createdAt,
        task: {
          _id: notification.taskId._id,
          title: notification.taskId.title,
          description: notification.taskId.description,
          dueDate: notification.taskId.dueDate,
          status: notification.taskId.status,
        },
      }));

      const unreadCount = notifications.filter((n) => !n.read).length;

      res.json({
        message: 'Notificaciones obtenidas exitosamente',
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationAsRead(req, res, next) {
    try {
      const userId = req.user._id;
      const notificationId = req.params.notificationId;

      const user = await userService.getById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      const notification = user.notifications.id(notificationId);
      if (!notification) {
        return res.status(404).json({
          error: 'Notificación no encontrada',
        });
      }

      notification.read = true;
      await user.save();

      res.json({
        message: 'Notificación marcada como leída',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsAsRead(req, res, next) {
    try {
      const userId = req.user._id;

      const user = await userService.getById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      user.notifications.forEach((notification) => {
        notification.read = true;
      });

      await user.save();

      res.json({
        message: 'Todas las notificaciones marcadas como leídas',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const userId = req.user._id;
      const notificationId = req.params.notificationId;

      const user = await userService.getById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado',
        });
      }

      user.notifications.id(notificationId).remove();
      await user.save();

      res.json({
        message: 'Notificación eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
