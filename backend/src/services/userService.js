const bcrypt = require('bcryptjs');
const User = require('../models/User');

class UserService {
  async create(userData) {
    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    const user = new User({
      ...userData,
      passwordHash,
      password: undefined, // Remover password del objeto
    });

    return await user.save();
  }

  async getAll() {
    return await User.find()
      .populate('departamentoId', 'name')
      .populate('roleIds', 'name')
      .select('-passwordHash')
      .sort({ name: 1 });
  }

  async getById(id) {
    const user = await User.findById(id)
      .populate('departamentoId', 'name')
      .populate('roleIds', 'name')
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

    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('departamentoId', 'name')
      .populate('roleIds', 'name')
      .select('-passwordHash');

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
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
