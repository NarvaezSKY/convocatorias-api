import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, maxlength: 50 },
  email: { type: String, required: true, unique: true, maxlength: 50 },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user', 'superadmin'], default: 'user' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
