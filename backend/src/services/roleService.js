const Role = require('../models/Role');
const userService = require('./userService');

class RoleService {
  async create(roleData) {
    const role = new Role(roleData);
    return await role.save();
  }

  async getAll() {
    return await Role.find()
      .populate('permissionIds', 'action resource')
      .sort({ createdAt: -1 });
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

    // Actualizar el timestamp de todos los usuarios que tienen este rol
    // Esto permite que el sistema de sincronización automática detecte los cambios
    try {
      await userService.updateUsersWithRole(id);
    } catch (error) {
      console.warn('⚠️ No se pudieron actualizar todos los usuarios con este rol:', error.message);
      // No lanzamos error porque la actualización del rol fue exitosa
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

      // Actualizar usuarios que tienen este rol
      try {
        await userService.updateUsersWithRole(roleId);
      } catch (error) {
        console.warn('⚠️ No se pudieron actualizar todos los usuarios con este rol:', error.message);
      }
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

    // Actualizar usuarios que tienen este rol
    try {
      await userService.updateUsersWithRole(roleId);
    } catch (error) {
      console.warn('⚠️ No se pudieron actualizar todos los usuarios con este rol:', error.message);
    }

    return await this.getById(roleId);
  }
}

module.exports = new RoleService();
