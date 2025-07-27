const permissionService = require('../services/permissionService');
const { validationResult } = require('express-validator');

class PermissionController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const permission = await permissionService.create(req.body);

      res.status(201).json({
        message: 'Permiso creado exitosamente',
        data: permission,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const permissions = await permissionService.getAll();

      res.json({
        message: 'Permisos obtenidos exitosamente',
        data: permissions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const permission = await permissionService.getById(req.params.id);

      res.json({
        message: 'Permiso obtenido exitosamente',
        data: permission,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const permission = await permissionService.update(
        req.params.id,
        req.body
      );

      res.json({
        message: 'Permiso actualizado exitosamente',
        data: permission,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await permissionService.delete(req.params.id);

      res.json({
        message: 'Permiso eliminado exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new PermissionController();
