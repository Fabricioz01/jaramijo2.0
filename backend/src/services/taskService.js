const Task = require('../models/Task');

class TaskService {
  async create(data) {
    const task = new Task(data);
    return await task.save();
  }

  async getAll() {
    return await Task.find()
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .populate('resolutionFileId', 'filename originalName mimeType size')
      .sort({ createdAt: -1 });
  }

  async getById(id) {
    const task = await Task.findById(id)
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .populate('resolutionFileId', 'filename originalName mimeType size');
    if (!task) throw new Error('Tarea no encontrada');
    return task;
  }

  async update(id, data) {
    const task = await Task.findByIdAndUpdate(
      id,
      { ...data, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .populate('resolutionFileId', 'filename originalName mimeType size');
    if (!task) throw new Error('Tarea no encontrada');
    return task;
  }

  async delete(id) {
    const task = await Task.findById(id).populate('attachmentIds');
    if (!task) throw new Error('Tarea no encontrada');

    if (task.attachmentIds && task.attachmentIds.length > 0) {
      const fileService = require('./fileService');
      for (const attachment of task.attachmentIds) {
        try {
          await fileService.delete(attachment._id);
        } catch (error) {
          console.error(`Error al eliminar archivo ${attachment._id}:`, error);
        }
      }
    }

    // Finalmente eliminar la tarea
    await Task.findByIdAndDelete(id);
    return task;
  }

  async getByDepartamento(departamentoId) {
    return await Task.find({ departamentoId })
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .sort({ createdAt: -1 });
  }

  async getByStatus(status) {
    return await Task.find({ status })
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .sort({ createdAt: -1 });
  }

  async getByAssignedUser(userId) {
    return await Task.find({ assignedToIds: userId })
      .populate({
        path: 'departamentoId',
        select: 'name direccionId',
        populate: {
          path: 'direccionId',
          select: 'name descripcion ubicacion activo',
        },
      })
      .populate('assignedToIds', 'name email')
      .populate('attachmentIds', 'filename originalName mimeType size')
      .sort({ createdAt: -1 });
  }

  async assignUser(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Tarea no encontrada');
    if (!task.assignedToIds.includes(userId)) {
      task.assignedToIds.push(userId);
      task.updatedAt = Date.now();
      await task.save();
    }
    return await this.getById(taskId);
  }

  async unassignUser(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Tarea no encontrada');
    task.assignedToIds = task.assignedToIds.filter((id) => !id.equals(userId));
    task.updatedAt = Date.now();
    await task.save();
    return await this.getById(taskId);
  }

  async addAttachment(taskId, fileId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Tarea no encontrada');
    if (!task.attachmentIds.includes(fileId)) {
      task.attachmentIds.push(fileId);
      task.updatedAt = Date.now();
      await task.save();
    }
    return await this.getById(taskId);
  }

  async removeAttachment(taskId, fileId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Tarea no encontrada');
    task.attachmentIds = task.attachmentIds.filter((id) => !id.equals(fileId));
    task.updatedAt = Date.now();
    await task.save();
    return await this.getById(taskId);
  }

  async removeResolutionFile(taskId) {
    const task = await Task.findById(taskId);
    if (!task) throw new Error('Tarea no encontrada');

    const resolutionFileId = task.resolutionFileId;

    task.resolutionFileId = null;
    task.status = 'pending';
    task.updatedAt = Date.now();
    await task.save();

    if (resolutionFileId) {
      try {
        const fileService = require('./fileService');
        await fileService.delete(resolutionFileId);
      } catch (error) {
        console.error('Error eliminando archivo de resolución:', error);
      }
    }

    return await this.getById(taskId);
  }
}

module.exports = new TaskService();
