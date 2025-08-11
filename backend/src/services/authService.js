const jwt = require('jsonwebtoken');
const userService = require('./userService');

class AuthService {
  generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await userService.getByEmail(email);

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.active) {
      throw new Error('Usuario inactivo');
    }

    const isValidPassword = await userService.validatePassword(user, password);

    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    const tokens = this.generateTokens(user._id);

    // Remover información sensible
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      departamentoId: user.departamentoId,
      roleIds: user.roleIds,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userResponse,
      tokens,
    };
  }

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await userService.getById(decoded.userId);

      if (!user || !user.active) {
        throw new Error('Usuario no válido');
      }

      const tokens = this.generateTokens(user._id);

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          departamentoId: user.departamentoId,
          roleIds: user.roleIds,
          active: user.active,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens,
      };
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  async logout() {
    return { message: 'Logout exitoso' };
  }

  async requestPasswordReset(email) {
    try {
      console.log('🔍 Validando solicitud de recuperación para:', email);

      // Llamar directamente al userService que ya valida si existe el usuario
      const result = await userService.requestPasswordReset(email);

      // Si userService devuelve null, significa que el usuario no existe
      if (result === null) {
        return {
          success: false,
          message: 'El correo no existe en el sistema.',
        };
      }

      // Si llegamos aquí, el proceso fue exitoso
      return {
        success: true,
        message:
          'Se han enviado las instrucciones para restablecer tu contraseña a tu correo electrónico.',
        data: {
          email: email,
        },
      };
    } catch (error) {
      console.error('Error en requestPasswordReset:', error);

      // Manejar errores específicos
      if (error.message === 'Usuario inactivo') {
        return {
          success: false,
          message: 'El usuario está inactivo. Contacta al administrador.',
        };
      }

      if (error.message === 'Error al enviar el correo de recuperación') {
        return {
          success: false,
          message:
            'Error al enviar el correo de recuperación. Inténtalo nuevamente.',
        };
      }

      return {
        success: false,
        message:
          'Error al procesar la solicitud de recuperación de contraseña.',
      };
    }
  }
}

module.exports = new AuthService();
