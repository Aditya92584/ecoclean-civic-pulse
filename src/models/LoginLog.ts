import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginLog extends Document {
  email: string;
  name: string;
  role: string;
  loginMethod: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const LoginLogSchema = new Schema(
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
      default: 'Password' // 'Password', 'Demo Switcher', 'Session Restore'
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

export const LoginLog = mongoose.models.LoginLog || mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);
export default LoginLog;
