const express = require('express');
const direccionController = require('../controllers/direccionController');
const { direccionValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/direcciones
router.get('/', direccionController.getAll);

// GET /api/v1/direcciones/:id
router.get('/:id', direccionController.getById);

// POST /api/v1/direcciones
router.post('/', direccionValidation.create, direccionController.create);

// PUT /api/v1/direcciones/:id
router.put('/:id', direccionValidation.update, direccionController.update);

// DELETE /api/v1/direcciones/:id
router.delete('/:id', direccionController.delete);

// GET /api/v1/direcciones/:id/departamentos
router.get('/:id/departamentos', direccionController.getDepartamentos);

module.exports = router;
