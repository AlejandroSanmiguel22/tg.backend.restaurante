import { Schema, model } from 'mongoose'

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
}, { timestamps: true })

export const CategoryModel = model('Category', CategorySchema)
