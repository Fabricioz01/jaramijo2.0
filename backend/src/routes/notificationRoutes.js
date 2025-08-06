const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authJwt = require('../middlewares/authJwt');

// Middleware de autenticación para todas las rutas
router.use(authJwt);

// GET /api/v1/notifications - Obtener notificaciones del usuario
router.get('/', notificationController.getUserNotifications);

// GET /api/v1/notifications/unread-count - Obtener conteo de no leídas
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/v1/notifications/:notificationId/read - Marcar como leída
router.patch('/:notificationId/read', notificationController.markAsRead);

// PATCH /api/v1/notifications/mark-all-read - Marcar todas como leídas
router.patch('/mark-all-read', notificationController.markAllAsRead);

// DELETE /api/v1/notifications/:notificationId - Eliminar notificación
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
