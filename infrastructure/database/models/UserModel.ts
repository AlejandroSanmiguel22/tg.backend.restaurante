import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'mesero', 'cliente'], required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'user'
})

export const UserModel = model('User', UserSchema)
