const express = require('express');
const authController = require('../controllers/authController');
const { authValidation } = require('../utils/validations');
const handleValidationErrors = require('../middlewares/handleValidationErrors');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

// Rutas para recuperación de contraseña
// POST /api/v1/auth/request-password-reset
router.post('/request-password-reset', 
  authValidation.requestPasswordReset,
  handleValidationErrors,
  authController.requestPasswordReset
);

// GET /api/v1/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// POST /api/v1/auth/reset-password
router.post('/reset-password', 
  authValidation.resetPassword,
  handleValidationErrors,
  authController.resetPassword
);

module.exports = router;
