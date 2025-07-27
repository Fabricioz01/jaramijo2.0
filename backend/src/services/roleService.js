const Role = require('../models/Role');

class RoleService {
  async create(roleData) {
    const role = new Role(roleData);
    return await role.save();
  }

  async getAll() {
    return await Role.find()
      .populate('permissionIds', 'action resource')
      .sort({ name: 1 });
  }

  async getById(id) {
    const role = await Role.findById(id).populate(
      'permissionIds',
      'action resource direccionId departamentoId'
    );

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  async update(id, updateData) {
    const role = await Role.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('permissionIds', 'action resource direccionId departamentoId');

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  async delete(id) {
    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  async addPermission(roleId, permissionId) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    if (!role.permissionIds.includes(permissionId)) {
      role.permissionIds.push(permissionId);
      role.updatedAt = Date.now();
      await role.save();
    }

    return await this.getById(roleId);
  }

  async removePermission(roleId, permissionId) {
    const role = await Role.findById(roleId);

    if (!role) {
      throw new Error('Rol no encontrado');
    }

    role.permissionIds = role.permissionIds.filter(
      (id) => !id.equals(permissionId)
    );
    role.updatedAt = Date.now();
    await role.save();

    return await this.getById(roleId);
  }
}

module.exports = new RoleService();
