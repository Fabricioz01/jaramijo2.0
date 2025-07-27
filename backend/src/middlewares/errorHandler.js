const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors,
    });
  }

  // Error de duplicado de MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      error: `El valor para el campo '${field}' ya existe`,
    });
  }

  // Error de cast de Mongoose (ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido proporcionado',
    });
  }

  // Errores de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Máximo 10MB permitido.',
      });
    }
    return res.status(400).json({
      error: err.message,
    });
  }

  // Errores 4xx - mostrar mensaje original
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      error: err.message || 'Error del cliente',
    });
  }

  // Errores 5xx - mensaje genérico
  return res.status(err.status || 500).json({
    error: 'Error interno del servidor',
  });
};

module.exports = errorHandler;
