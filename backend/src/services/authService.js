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
    // En una implementación más completa, aquí se agregaría el token a una blacklist
    return { message: 'Logout exitoso' };
  }
}

module.exports = new AuthService();
