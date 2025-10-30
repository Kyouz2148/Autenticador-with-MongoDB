const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  secret: {
    type: String,
    required: true
  }, // Será criptografado antes de salvar
  issuer: {
    type: String,
    trim: true,
    maxlength: 100
  },
  digits: {
    type: Number,
    default: 6,
    min: 6,
    max: 8
  },
  period: {
    type: Number,
    default: 30,
    min: 15,
    max: 300
  },
  algorithm: {
    type: String,
    default: 'sha1',
    enum: ['sha1', 'sha256', 'sha512']
  },
  icon: {
    type: String,
    default: 'default'
  },
  color: {
    type: String,
    default: '#1976d2'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index para otimizar queries
accountSchema.index({ userId: 1, isActive: 1 });
accountSchema.index({ userId: 1, order: 1 });

module.exports = mongoose.model('Account', accountSchema);