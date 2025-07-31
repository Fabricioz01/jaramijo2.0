const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
}

module.exports = new UserService();
