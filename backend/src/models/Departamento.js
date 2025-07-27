const mongoose = require('mongoose');

const departamentoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  direccionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direccion',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

departamentoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Departamento', departamentoSchema);
