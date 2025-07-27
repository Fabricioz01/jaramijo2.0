const express = require('express');
const roleController = require('../controllers/roleController');
const { roleValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/roles
router.get('/', roleController.getAll);

// GET /api/v1/roles/:id
router.get('/:id', roleController.getById);

// POST /api/v1/roles
router.post('/', roleValidation.create, roleController.create);

// PUT /api/v1/roles/:id
router.put('/:id', roleValidation.update, roleController.update);

// DELETE /api/v1/roles/:id
router.delete('/:id', roleController.delete);

// POST /api/v1/roles/:id/permissions
router.post('/:id/permissions', roleController.addPermission);

// DELETE /api/v1/roles/:id/permissions/:permissionId
router.delete(
  '/:id/permissions/:permissionId',
  roleController.removePermission
);

module.exports = router;
