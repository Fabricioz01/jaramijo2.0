const Permission = require('../models/Permission');

class PermissionService {
  async create(permissionData) {
    const permission = new Permission(permissionData);
    return await permission.save();
  }

  async getAll() {
    return await Permission.find()
      .populate('direccionId', 'name')
      .populate('departamentoId', 'name')
      .sort({ createdAt: -1 });
  }

  async getById(id) {
    const permission = await Permission.findById(id)
      .populate('direccionId', 'name')
      .populate('departamentoId', 'name');

    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return permission;
  }

  async update(id, updateData) {
    const permission = await Permission.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
      .populate('direccionId', 'name')
      .populate('departamentoId', 'name');

    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return permission;
  }

  async delete(id) {
    const permission = await Permission.findByIdAndDelete(id);

    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return permission;
  }

  async getByResource(resource) {
    return await Permission.find({ resource })
      .populate('direccionId', 'name')
      .populate('departamentoId', 'name')
      .sort({ action: 1 });
  }

  async getByAction(action) {
    return await Permission.find({ action })
      .populate('direccionId', 'name')
      .populate('departamentoId', 'name')
      .sort({ resource: 1 });
  }
}

module.exports = new PermissionService();
