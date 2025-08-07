const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  cedula: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  direccionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Direccion',
    required: false,
  },
  departamentoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Departamento',
    required: true,
  },
  roleIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      default: [],
    },
  ],
  notifications: [
    {
      message: {
        type: String,
        required: true,
      },
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
      },
      read: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['task_assigned', 'task_due_today', 'task_overdue'],
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Campos para recuperación de contraseña
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
  active: {
    type: Boolean,
    default: true,
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

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
