const { body } = require('express-validator');

const authValidation = {
  login: [
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],

  refresh: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Token de refresh es requerido'),
  ],
};

const direccionValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  ],
};

const departamentoValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('direccionId')
      .notEmpty()
      .withMessage('La dirección es requerida')
      .isMongoId()
      .withMessage('ID de dirección inválido'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('direccionId')
      .optional()
      .isMongoId()
      .withMessage('ID de dirección inválido'),
  ],
};

const userValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('departamentoId')
      .notEmpty()
      .withMessage('El departamento es requerido')
      .isMongoId()
      .withMessage('ID de departamento inválido'),
    body('roleIds')
      .optional()
      .isArray()
      .withMessage('Los roles deben ser un array'),
    body('roleIds.*').isMongoId().withMessage('ID de rol inválido'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('departamentoId')
      .optional()
      .isMongoId()
      .withMessage('ID de departamento inválido'),
    body('roleIds')
      .optional()
      .isArray()
      .withMessage('Los roles deben ser un array'),
    body('roleIds.*').isMongoId().withMessage('ID de rol inválido'),
  ],
};

const roleValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('El nombre es requerido')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('permissionIds')
      .optional()
      .isArray()
      .withMessage('Los permisos deben ser un array'),
    body('permissionIds.*').isMongoId().withMessage('ID de permiso inválido'),
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('permissionIds')
      .optional()
      .isArray()
      .withMessage('Los permisos deben ser un array'),
    body('permissionIds.*').isMongoId().withMessage('ID de permiso inválido'),
  ],
};

const permissionValidation = {
  create: [
    body('action')
      .isIn(['create', 'read', 'update', 'delete'])
      .withMessage('Acción debe ser: create, read, update, delete'),
    body('resource')
      .notEmpty()
      .withMessage('El recurso es requerido')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El recurso debe tener entre 2 y 50 caracteres'),
    body('direccionId')
      .optional()
      .isMongoId()
      .withMessage('ID de dirección inválido'),
    body('departamentoId')
      .optional()
      .isMongoId()
      .withMessage('ID de departamento inválido'),
  ],

  update: [
    body('action')
      .optional()
      .isIn(['create', 'read', 'update', 'delete'])
      .withMessage('Acción debe ser: create, read, update, delete'),
    body('resource')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El recurso debe tener entre 2 y 50 caracteres'),
    body('direccionId')
      .optional()
      .isMongoId()
      .withMessage('ID de dirección inválido'),
    body('departamentoId')
      .optional()
      .isMongoId()
      .withMessage('ID de departamento inválido'),
  ],
};

const taskValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('El título es requerido')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('El título debe tener entre 2 y 200 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Fecha de vencimiento inválida'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Estado debe ser: pending, in_progress, completed'),
    body('departamentoId')
      .notEmpty()
      .withMessage('El departamento es requerido')
      .isMongoId()
      .withMessage('ID de departamento inválido'),
    body('assignedToIds')
      .optional()
      .isArray()
      .withMessage('Los asignados deben ser un array'),
    body('assignedToIds.*').isMongoId().withMessage('ID de usuario inválido'),
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('El título debe tener entre 2 y 200 caracteres'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('La descripción no puede exceder 1000 caracteres'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Fecha de vencimiento inválida'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Estado debe ser: pending, in_progress, completed'),
    body('departamentoId')
      .optional()
      .isMongoId()
      .withMessage('ID de departamento inválido'),
    body('assignedToIds')
      .optional()
      .isArray()
      .withMessage('Los asignados deben ser un array'),
    body('assignedToIds.*').isMongoId().withMessage('ID de usuario inválido'),
  ],
};

module.exports = {
  authValidation,
  direccionValidation,
  departamentoValidation,
  userValidation,
  roleValidation,
  permissionValidation,
  taskValidation,
};
