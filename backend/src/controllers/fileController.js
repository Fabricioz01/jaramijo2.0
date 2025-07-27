const fileService = require('../services/fileService');

class FileController {
  async getAll(req, res, next) {
    try {
      const files = await fileService.getAll();

      res.json({
        message: 'Archivos obtenidos exitosamente',
        data: files,
      });
    } catch (error) {
      error.status = 500;
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { file, filePath } = await fileService.getFilePath(req.params.id);

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.originalName}"`
      );
      res.setHeader('Content-Type', file.mimeType);

      res.sendFile(filePath);
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const file = await fileService.getById(req.params.id);

      res.json({
        message: 'Archivo obtenido exitosamente',
        data: file,
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await fileService.delete(req.params.id);

      res.json({
        message: 'Archivo eliminado exitosamente',
      });
    } catch (error) {
      error.status = 404;
      next(error);
    }
  }
}

module.exports = new FileController();
