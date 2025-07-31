const Direccion = require('../models/Direccion');
const Departamento = require('../models/Departamento');

class DireccionService {
  async create(direccionData) {
    // Solo tomar los campos válidos del modelo
    const data = {
      name: direccionData.name,
      descripcion: direccionData.descripcion,
      ubicacion: direccionData.ubicacion,
      activo: direccionData.activo !== undefined ? direccionData.activo : true,
    };
    const direccion = new Direccion(data);
    return await direccion.save();
  }

  async getAll() {
    return await Direccion.find().sort({ createdAt: -1 });
  }

  async getById(id) {
    const direccion = await Direccion.findById(id);
    if (!direccion) {
      throw new Error('Dirección no encontrada');
    }
    return direccion;
  }

  async update(id, updateData) {
    // Solo tomar los campos válidos del modelo
    const data = {
      name: updateData.name,
      descripcion: updateData.descripcion,
      ubicacion: updateData.ubicacion,
      activo: updateData.activo,
      updatedAt: Date.now(),
    };
    const direccion = await Direccion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

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
