const fileService = require('../services/fileService');

class FileController {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No se envió ningún archivo.' });
      }
      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploaderId: req.user._id,
        createdAt: new Date(),
      };
      const file = await require('../services/fileService').create(fileData);
      res.status(201).json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: file,
      });
    } catch (error) {
      error.status = 500;
      next(error);
    }
  }
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
