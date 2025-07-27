const express = require('express');
const taskController = require('../controllers/taskController');
const { taskValidation } = require('../utils/validations');
const authJwt = require('../middlewares/authJwt');
const upload = require('../middlewares/multerUpload');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authJwt);

// GET /api/v1/tasks
router.get('/', taskController.getAll);

// GET /api/v1/tasks/:id
router.get('/:id', taskController.getById);

// POST /api/v1/tasks
router.post('/', taskValidation.create, taskController.create);

// PUT /api/v1/tasks/:id
router.put('/:id', taskValidation.update, taskController.update);

// DELETE /api/v1/tasks/:id
router.delete('/:id', taskController.delete);

// POST /api/v1/tasks/:id/attach - Subir archivo a una tarea
router.post('/:id/attach', upload.single('file'), taskController.attachFile);

// DELETE /api/v1/tasks/:id/attachments/:fileId - Remover archivo de una tarea
router.delete('/:id/attachments/:fileId', taskController.removeAttachment);

module.exports = router;
