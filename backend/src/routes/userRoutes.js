const express = require('express');
const userController = require('../controllers/userController');
const { userValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/users
router.get('/', userController.getAll);

// GET /api/v1/users/:id
router.get('/:id', userController.getById);

// POST /api/v1/users
router.post('/', userValidation.create, userController.create);

// PUT /api/v1/users/:id
router.put('/:id', userValidation.update, userController.update);

// DELETE /api/v1/users/:id
router.delete('/:id', userController.delete);

// PATCH /api/v1/users/:id/toggle-active
router.patch('/:id/toggle-active', userController.toggleActive);

module.exports = router;
