const direccionService = require('../services/direccionService');
const { validationResult } = require('express-validator');

class DireccionController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const direccion = await direccionService.create(req.body);

      res.status(201).json({
        message: 'Dirección creada exitosamente',
        data: direccion,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const direcciones = await direccionService.getAll();
      // Devolver todos los campos del modelo
      res.json({
        message: 'Direcciones obtenidas exitosamente',
        data: direcciones.map(d => ({
          _id: d._id,
          name: d.name,
          descripcion: d.descripcion !== undefined ? d.descripcion : null,
          ubicacion: d.ubicacion !== undefined ? d.ubicacion : null,
          activo: d.activo,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          __v: d.__v
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const d = await direccionService.getById(req.params.id);
      res.json({
        message: 'Dirección obtenida exitosamente',
        data: {
          _id: d._id,
          name: d.name,
          descripcion: d.descripcion !== undefined ? d.descripcion : null,
          ubicacion: d.ubicacion !== undefined ? d.ubicacion : null,
          activo: d.activo,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          __v: d.__v
        },
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

      const direccion = await direccionService.update(req.params.id, req.body);

      res.json({
        message: 'Dirección actualizada exitosamente',
        data: direccion,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrada') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await direccionService.delete(req.params.id);

      res.json({
        message: 'Dirección eliminada exitosamente',
      });
    } catch (error) {
      error.status = error.message.includes('no encontrada') ? 404 : 400;
      next(error);
    }
  }

  async getDepartamentos(req, res, next) {
    try {
      const departamentos = await direccionService.getDepartamentos(
        req.params.id
      );

      res.json({
        message: 'Departamentos obtenidos exitosamente',
        data: departamentos,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new DireccionController();
