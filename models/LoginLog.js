const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      default: 'Unknown User',
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ['Citizen', 'Admin', 'Sanitation Staff']
    },
    loginMethod: {
      type: String,
      default: 'Password'
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

LoginLogSchema.index({ timestamp: -1 });

module.exports = mongoose.models.LoginLog || mongoose.model('LoginLog', LoginLogSchema);
