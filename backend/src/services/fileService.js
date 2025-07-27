const File = require('../models/File');
const fs = require('fs');
const path = require('path');

class FileService {
  async create(fileData) {
    const file = new File(fileData);
    return await file.save();
  }

  async getAll() {
    return await File.find()
      .populate('uploaderId', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
  }

  async getById(id) {
    const file = await File.findById(id)
      .populate('uploaderId', 'name email')
      .populate('taskId', 'title');

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    return file;
  }

  async getByTask(taskId) {
    return await File.find({ taskId })
      .populate('uploaderId', 'name email')
      .sort({ createdAt: -1 });
  }

  async getByUploader(uploaderId) {
    return await File.find({ uploaderId })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });
  }

  async delete(id) {
    const file = await File.findById(id);

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    // Eliminar archivo físico
    const filePath = path.join(__dirname, '../../uploads', file.filename);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error al eliminar archivo físico:', error);
    }

    await File.findByIdAndDelete(id);

    return file;
  }

  async getFilePath(id) {
    const file = await this.getById(id);
    const filePath = path.join(__dirname, '../../uploads', file.filename);

    if (!fs.existsSync(filePath)) {
      throw new Error('Archivo físico no encontrado');
    }

    return {
      file,
      filePath,
    };
  }

  async updateTaskAssociation(fileId, taskId) {
    const file = await File.findByIdAndUpdate(fileId, { taskId }, { new: true })
      .populate('uploaderId', 'name email')
      .populate('taskId', 'title');

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    return file;
  }
}

module.exports = new FileService();
