const express = require('express');
const fileController = require('../controllers/fileController');
const authJwt = require('../middlewares/authJwt');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

const upload = require('../middlewares/multerUpload');

// POST /api/v1/files - Subir archivo PDF o Excel
router.post('/', upload.single('file'), fileController.upload);

// GET /api/v1/files - Obtener todos los archivos
router.get('/', fileController.getAll);

// GET /api/v1/files/:id/download - Descargar archivo
router.get('/:id/download', fileController.download);

// GET /api/v1/files/:id - Obtener información del archivo
router.get('/:id', fileController.getById);

// DELETE /api/v1/files/:id - Eliminar archivo
router.delete('/:id', fileController.delete);

module.exports = router;
