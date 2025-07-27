const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
