const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authJwt = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('roleIds');

    if (!user || !user.active) {
      return res.status(401).json({
        error: 'Token inválido o usuario inactivo.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado.',
      });
    }

    return res.status(401).json({
      error: 'Token inválido.',
    });
  }
};

module.exports = authJwt;
