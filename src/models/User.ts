import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Citizen' | 'Admin' | 'Sanitation Staff';
  avatar?: string;
  squad?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, default: '123456' },
    role: {
      type: String,
      required: true,
      enum: ['Citizen', 'Admin', 'Sanitation Staff'],
      default: 'Citizen'
    },
    avatar: { type: String, default: '' },
    squad: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
