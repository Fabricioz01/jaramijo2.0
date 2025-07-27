const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete'],
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  direccionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direccion',
    required: false,
  },
  departamentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departamento',
    required: false,
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

permissionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
