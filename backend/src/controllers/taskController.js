const taskService = require('../services/taskService');
const fileService = require('../services/fileService');
const { validationResult } = require('express-validator');

class TaskController {
  async create(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array(),
        });
      }

      const task = await taskService.create(req.body);

      res.status(201).json({
        message: 'Tarea creada exitosamente',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const tasks = await taskService.getAll();

      res.json({
        message: 'Tareas obtenidas exitosamente',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const task = await taskService.getById(req.params.id);

      res.json({
        message: 'Tarea obtenida exitosamente',
        data: task,
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

      const task = await taskService.update(req.params.id, req.body);

      res.json({
        message: 'Tarea actualizada exitosamente',
        data: task,
      });
    } catch (error) {
      error.status = error.message.includes('no encontrada') ? 404 : 400;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await taskService.delete(req.params.id);

      res.json({
        message: 'Tarea eliminada exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async attachFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Archivo no proporcionado',
        });
      }

      // Crear registro del archivo en la base de datos
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploaderId: req.user._id,
        taskId: req.params.id,
      };

      const file = await fileService.create(fileData);

      // Asociar archivo con la tarea
      const task = await taskService.addAttachment(req.params.id, file._id);

      res.json({
        message: 'Archivo adjuntado exitosamente',
        data: {
          task,
          file,
        },
      });
    } catch (error) {
      error.status = error.message.includes('no encontrada') ? 404 : 400;
      next(error);
    }
  }

  async removeAttachment(req, res, next) {
    try {
      const task = await taskService.removeAttachment(
        req.params.id,
        req.params.fileId
      );

      res.json({
        message: 'Archivo removido de la tarea exitosamente',
        data: task,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new TaskController();
