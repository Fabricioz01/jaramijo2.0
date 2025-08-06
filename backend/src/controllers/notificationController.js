const Notification = require('../models/Notification');

class NotificationController {
  // Obtener notificaciones del usuario autenticado
  async getUserNotifications(req, res, next) {
    try {
      const userId = req.user._id || req.user.userId;
      console.log(
        '🔔 [NotificationController] Obteniendo notificaciones para usuario:',
        userId
      );
      console.log('🔔 [NotificationController] Usuario completo:', {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
      });

      const { limit = 20, skip = 0, unreadOnly = false } = req.query;

      const options = {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === 'true',
      };

      const notifications = await Notification.getByUserId(userId, options);

      console.log(
        `✅ [NotificationController] ${notifications.length} notificaciones encontradas`
      );

      res.json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error) {
      console.error(
        '❌ [NotificationController] Error al obtener notificaciones:',
        error
      );
      next(error);
    }
  }

  // Marcar notificación como leída
  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      console.log(
        '📖 [NotificationController] Marcando notificación como leída:',
        notificationId
      );

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }

      // Verificar que la notificación pertenece al usuario autenticado
      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta notificación',
        });
      }

      const updatedNotification = await Notification.markAsRead(notificationId);

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: updatedNotification,
      });
    } catch (error) {
      console.error(
        '❌ [NotificationController] Error al marcar como leída:',
        error
      );
      next(error);
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user._id || req.user.userId;
      console.log(
        '📖 [NotificationController] Marcando todas las notificaciones como leídas para usuario:',
        userId
      );

      const result = await Notification.updateMany(
        { userId: userId, read: false },
        {
          read: true,
          readAt: new Date(),
        }
      );

      console.log(
        `✅ [NotificationController] ${result.modifiedCount} notificaciones marcadas como leídas`
      );

      res.json({
        success: true,
        message: `${result.modifiedCount} notificaciones marcadas como leídas`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error(
        '❌ [NotificationController] Error al marcar todas como leídas:',
        error
      );
      next(error);
    }
  }

  // Eliminar notificación
  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      console.log(
        '🗑️ [NotificationController] Eliminando notificación:',
        notificationId
      );

      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificación no encontrada',
        });
      }

      // Verificar que la notificación pertenece al usuario autenticado
      if (notification.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para eliminar esta notificación',
        });
      }

      await Notification.findByIdAndDelete(notificationId);

      console.log(
        '✅ [NotificationController] Notificación eliminada exitosamente'
      );

      res.json({
        success: true,
        message: 'Notificación eliminada exitosamente',
      });
    } catch (error) {
      console.error(
        '❌ [NotificationController] Error al eliminar notificación:',
        error
      );
      next(error);
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user._id || req.user.userId;
      console.log(
        '🔢 [NotificationController] Obteniendo conteo de no leídas para usuario:',
        userId
      );

      const count = await Notification.countDocuments({
        userId: userId,
        read: false,
      });

      console.log(
        `✅ [NotificationController] ${count} notificaciones no leídas`
      );

      res.json({
        success: true,
        count: count,
      });
    } catch (error) {
      console.error(
        '❌ [NotificationController] Error al obtener conteo:',
        error
      );
      next(error);
    }
  }
}

module.exports = new NotificationController();
