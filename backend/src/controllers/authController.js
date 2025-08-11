const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userService = require('../services/userService');
const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
        });
      }

      const user = await User.findOne({ email })
        .populate('roleIds')
        .populate('departamentoId');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }

      // Verificar si el usuario está activo
      if (!user.active) {
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

  // Métodos para recuperación de contraseña
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es requerido',
        });
      }


      // Usar authService en lugar de userService directamente
      const result = await authService.requestPasswordReset(email);

      // Devolver la respuesta basada en si el usuario existe o no
      res.json(result);
    } catch (error) {
      console.error('❌ Error en requestPasswordReset:', error);

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token requerido',
        });
      }

      const result = await userService.verifyResetToken(token);

      res.json({
        success: true,
        message: 'Token válido',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error en verifyResetToken:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      if (!token || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token, contraseña y confirmación son requeridos',
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Las contraseñas no coinciden',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres',
        });
      }

      const result = await userService.resetPassword(token, password);

      res.json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
