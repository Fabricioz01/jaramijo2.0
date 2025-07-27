const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const user = await userService.create(req.body);

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();

      res.json({
        message: 'Usuarios obtenidos exitosamente',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);

      res.json({
        message: 'Usuario obtenido exitosamente',
        data: user,
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

      const user = await userService.update(req.params.id, req.body);

      res.json({
        message: 'Usuario actualizado exitosamente',
        data: user,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(req.params.id);

      res.json({
        message: 'Usuario eliminado exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const user = await userService.toggleActive(req.params.id);

      res.json({
        message: `Usuario ${
          user.active ? 'activado' : 'desactivado'
        } exitosamente`,
        data: user,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new UserController();
