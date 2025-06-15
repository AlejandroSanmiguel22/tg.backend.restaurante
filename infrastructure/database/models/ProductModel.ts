import { Schema, model } from 'mongoose'

const VariantSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false })

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  variants: [VariantSchema]
}, { timestamps: true })

export const productModel = model('product', productSchema)
