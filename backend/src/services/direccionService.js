const Direccion = require('../models/Direccion');
const Departamento = require('../models/Departamento');

class DireccionService {
  async create(direccionData) {
    const direccion = new Direccion(direccionData);
    return await direccion.save();
  }

  async getAll() {
    return await Direccion.find().sort({ name: 1 });
  }

  async getById(id) {
    const direccion = await Direccion.findById(id);
    if (!direccion) {
      throw new Error('Dirección no encontrada');
    }
    return direccion;
  }

  async update(id, updateData) {
    const direccion = await Direccion.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!direccion) {
      throw new Error('Dirección no encontrada');
    }

    return direccion;
  }

  async delete(id) {
    // Verificar si tiene departamentos hijos
    const departamentosCount = await Departamento.countDocuments({
      direccionId: id,
    });

    if (departamentosCount > 0) {
      throw new Error(
        'No se puede eliminar la dirección porque tiene departamentos asociados'
      );
    }

    const direccion = await Direccion.findByIdAndDelete(id);

    if (!direccion) {
      throw new Error('Dirección no encontrada');
    }

    return direccion;
  }

  async getDepartamentos(direccionId) {
    await this.getById(direccionId); // Verificar que existe
    return await Departamento.find({ direccionId }).sort({ name: 1 });
  }
}

module.exports = new DireccionService();
