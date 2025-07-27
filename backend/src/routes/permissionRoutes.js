const express = require('express');
const permissionController = require('../controllers/permissionController');
const { permissionValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/permissions
router.get('/', permissionController.getAll);

// GET /api/v1/permissions/:id
router.get('/:id', permissionController.getById);

// POST /api/v1/permissions
router.post('/', permissionValidation.create, permissionController.create);

// PUT /api/v1/permissions/:id
router.put('/:id', permissionValidation.update, permissionController.update);

// DELETE /api/v1/permissions/:id
router.delete('/:id', permissionController.delete);

module.exports = router;
