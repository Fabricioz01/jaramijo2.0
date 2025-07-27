const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
  async login(req, res, next) {
    try {
      console.log('🔐 Intento de login:', req.body);

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
        });
      }

      // Buscar usuario por email
      const user = await User.findOne({ email })
        .populate('roleIds')
        .populate('departamentoId');

      if (!user) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        console.log('❌ Contraseña inválida para:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Verificar si el usuario está activo
      if (!user.active) {
        console.log('❌ Usuario inactivo:', email);
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo',
        });
      }

      // Generar tokens
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          roles: user.roleIds,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      console.log('✅ Login exitoso para:', email);

      // Respuesta exitosa
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roleIds,
            departamento: user.departamentoId,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requerido',
        });
      }

      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).populate('roleIds');

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado o inactivo',
        });
      }

      // Generar nuevo access token
      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          roles: user.roleIds,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roleIds,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      console.error('❌ Error en refresh:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
  }

  async logout(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Logout exitoso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}

module.exports = new AuthController();
