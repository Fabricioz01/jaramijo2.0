const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('./emailService');

class UserService {
  async create(userData) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    const user = new User({
      name: userData.name,
      lastName: userData.lastName,
      cedula: userData.cedula,
      phone: userData.phone,
      position: userData.position,
      email: userData.email,
      passwordHash,
      direccionId: userData.direccionId,
      departamentoId: userData.departamentoId,
      roleIds: userData.roleIds,
      active: userData.active !== undefined ? userData.active : true,
    });

    return await user.save();
  }

  async getAll() {
    return await User.find()
      .populate('departamentoId', 'name')
      .populate('roleIds', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 });
  }

  async getById(id) {
    const user = await User.findById(id)
      .populate('direccionId')
      .populate('departamentoId')
      .populate('roleIds')
      .select('-passwordHash');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async getByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() })
      .populate('departamentoId', 'name')
      .populate('roleIds', 'name');
  }

  async update(id, updateData) {
    // Si se está actualizando la contraseña
    if (updateData.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(
        updateData.password,
        saltRounds
      );
      delete updateData.password;
    }

    // Incluir direccionId y demás campos relevantes en la actualización
    const updated = await User.findByIdAndUpdate(
      id,
      {
        name: updateData.name,
        lastName: updateData.lastName,
        cedula: updateData.cedula,
        phone: updateData.phone,
        position: updateData.position,
        email: updateData.email,
        direccionId: updateData.direccionId,
        departamentoId: updateData.departamentoId,
        roleIds: updateData.roleIds,
        active: updateData.active,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error('Usuario no encontrado');
    }

    // Devolver el usuario actualizado sin populate (documento plano)
    return updated;
  }

  async delete(id) {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }

  async toggleActive(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.active = !user.active;
    user.updatedAt = Date.now();

    await user.save();

    return await this.getById(id);
  }

  async validatePassword(user, password) {
    return await bcrypt.compare(password, user.passwordHash);
  }

  async getByDepartamento(departamentoId) {
    return await User.find({ departamentoId })
      .populate('roleIds', 'name')
      .select('-passwordHash')
      .sort({ name: 1 });
  }

  // Métodos para recuperación de contraseña
  async requestPasswordReset(email) {
    console.log('🔍 Buscando usuario con email:', email);
    
    const user = await User.findOne({ email: email.toLowerCase() })
      .populate('departamentoId', 'name');
    
    if (!user) {
      console.log('❌ Usuario no encontrado para:', email);
      // No lanzar error por seguridad, solo registrar el intento
      throw new Error('Usuario no encontrado');
    }

    if (!user.active) {
      console.log('❌ Usuario inactivo:', email);
      throw new Error('Usuario inactivo');
    }

    console.log('✅ Usuario encontrado:', user.name, '-', user.email);

    // Generar token seguro
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Establecer el token y su expiración (1 hora)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    
    await user.save();
    console.log('✅ Token de reset generado y guardado para:', user.email);

    // Enviar correo
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
      console.log(`✅ Correo de recuperación enviado exitosamente a: ${user.email}`);
      
      return {
        message: 'Correo de recuperación enviado exitosamente',
        email: user.email,
        success: true
      };
    } catch (error) {
      console.error('❌ Error enviando correo:', error);
      // Si falla el correo, limpiar el token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña y limpiar token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = Date.now();

    await user.save();

    // Enviar notificación de cambio (no bloqueante)
    try {
      await emailService.sendPasswordChangedNotification(user.email, user.name);
    } catch (error) {
      console.error('❌ Error enviando notificación de cambio:', error);
      // No lanzamos error porque el cambio ya se realizó
    }

    console.log(`✅ Contraseña restablecida para: ${user.email}`);
    
    return {
      message: 'Contraseña actualizada correctamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  }

  async verifyResetToken(token) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('name email resetPasswordExpires');

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    return {
      valid: true,
      user: {
        name: user.name,
        email: user.email
      },
      expiresAt: user.resetPasswordExpires
    };
  }
}

module.exports = new UserService();
