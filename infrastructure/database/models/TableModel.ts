import { Schema, model } from 'mongoose'

const TableSchema = new Schema({
  number: { 
    type: Number, 
    required: true, 
    unique: true,
    min: 1 
  },
  status: { 
    type: String, 
    enum: ['libre', 'atendida'], 
    default: 'libre',
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  collection: 'tables'
})

// Índices para mejorar el rendimiento
TableSchema.index({ status: 1 })
TableSchema.index({ isActive: 1 })

export const TableModel = model('Table', TableSchema) 