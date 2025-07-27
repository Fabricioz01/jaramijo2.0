const departamentoService = require('../services/departamentoService');
const { validationResult } = require('express-validator');

class DepartamentoController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const departamento = await departamentoService.create(req.body);

      res.status(201).json({
        message: 'Departamento creado exitosamente',
        data: departamento,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const departamentos = await departamentoService.getAll();

      res.json({
        message: 'Departamentos obtenidos exitosamente',
        data: departamentos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const departamento = await departamentoService.getById(req.params.id);

      res.json({
        message: 'Departamento obtenido exitosamente',
        data: departamento,
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

      const departamento = await departamentoService.update(
        req.params.id,
        req.body
      );

      res.json({
        message: 'Departamento actualizado exitosamente',
        data: departamento,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await departamentoService.delete(req.params.id);

      res.json({
        message: 'Departamento eliminado exitosamente',
      });
    } catch (error) {
      error.status = error.message.includes('no encontrado') ? 404 : 400;
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await departamentoService.getUsers(req.params.id);

      res.json({
        message: 'Usuarios obtenidos exitosamente',
        data: users,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new DepartamentoController();
