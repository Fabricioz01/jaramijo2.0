const express = require('express');
const fileController = require('../controllers/fileController');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/files - Obtener todos los archivos
router.get('/', fileController.getAll);

// GET /api/v1/files/:id/download - Descargar archivo
router.get('/:id/download', fileController.download);

// GET /api/v1/files/:id - Obtener información del archivo
router.get('/:id', fileController.getById);

// DELETE /api/v1/files/:id - Eliminar archivo
router.delete('/:id', fileController.delete);

module.exports = router;
