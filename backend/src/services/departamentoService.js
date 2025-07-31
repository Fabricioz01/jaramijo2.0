const Departamento = require('../models/Departamento');
const User = require('../models/User');

class DepartamentoService {
  async create(departamentoData) {
    const departamento = new Departamento(departamentoData);
    return await departamento.save();
  }

  async getAll() {
    return await Departamento.find()
      .populate('direccionId', 'name')
      .sort({ createdAt: -1 });
  }

  async getById(id) {
    const departamento = await Departamento.findById(id).populate(
      'direccionId',
      'name'
    );

    if (!departamento) {
      throw new Error('Departamento no encontrado');
    }

    return departamento;
  }

  async update(id, updateData) {
    const departamento = await Departamento.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('direccionId', 'name');

    if (!departamento) {
      throw new Error('Departamento no encontrado');
    }

    return departamento;
  }

  async delete(id) {
    // Verificar si tiene usuarios
    const usersCount = await User.countDocuments({ departamentoId: id });

    if (usersCount > 0) {
      throw new Error(
        'No se puede eliminar el departamento porque tiene usuarios asociados'
      );
    }

    const departamento = await Departamento.findByIdAndDelete(id);

    if (!departamento) {
      throw new Error('Departamento no encontrado');
    }

    return departamento;
  }

  async getByDireccion(direccionId) {
    return await Departamento.find({ direccionId })
      .populate('direccionId', 'name')
      .sort({ name: 1 });
  }

  async getUsers(departamentoId) {
    await this.getById(departamentoId); // Verificar que existe
    return await User.find({ departamentoId })
      .populate('roleIds', 'name')
      .sort({ name: 1 });
  }
}

module.exports = new DepartamentoService();
