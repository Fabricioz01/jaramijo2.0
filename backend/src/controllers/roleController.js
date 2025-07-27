const roleService = require('../services/roleService');
const { validationResult } = require('express-validator');

class RoleController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const role = await roleService.create(req.body);

      res.status(201).json({
        message: 'Rol creado exitosamente',
        data: role,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const roles = await roleService.getAll();

      res.json({
        message: 'Roles obtenidos exitosamente',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const role = await roleService.getById(req.params.id);

      res.json({
        message: 'Rol obtenido exitosamente',
        data: role,
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

      const role = await roleService.update(req.params.id, req.body);

      res.json({
        message: 'Rol actualizado exitosamente',
        data: role,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await roleService.delete(req.params.id);

      res.json({
        message: 'Rol eliminado exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async addPermission(req, res, next) {
    try {
      const { permissionId } = req.body;
      const role = await roleService.addPermission(req.params.id, permissionId);

      res.json({
        message: 'Permiso agregado al rol exitosamente',
        data: role,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async removePermission(req, res, next) {
    try {
      const role = await roleService.removePermission(
        req.params.id,
        req.params.permissionId
      );

      res.json({
        message: 'Permiso removido del rol exitosamente',
        data: role,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new RoleController();
