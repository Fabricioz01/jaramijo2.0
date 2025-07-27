const express = require('express');
const departamentoController = require('../controllers/departamentoController');
const { departamentoValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/departamentos
router.get('/', departamentoController.getAll);

// GET /api/v1/departamentos/:id
router.get('/:id', departamentoController.getById);

// POST /api/v1/departamentos
router.post('/', departamentoValidation.create, departamentoController.create);

// PUT /api/v1/departamentos/:id
router.put(
  '/:id',
  departamentoValidation.update,
  departamentoController.update
);

// DELETE /api/v1/departamentos/:id
router.delete('/:id', departamentoController.delete);

// GET /api/v1/departamentos/:id/users
router.get('/:id/users', departamentoController.getUsers);

module.exports = router;
