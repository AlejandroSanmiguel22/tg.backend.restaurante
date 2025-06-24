import { Schema, model } from 'mongoose'

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  _id: true,
  timestamps: false
})

const OrderSchema = new Schema({
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  waiterId: {
    type: Schema.Types.ObjectId,
    ref: 'Waiter',
    required: true
  },
  status: {
    type: String,
    enum: ['en_cocina', 'entregado', 'facturada'],
    default: 'en_cocina',
    required: true
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tip: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  closedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'orders'
})

// Índices para mejorar el rendimiento
OrderSchema.index({ tableId: 1 })
OrderSchema.index({ waiterId: 1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ tableId: 1, status: 1 }) // Para buscar órdenes activas por mesa

export const OrderModel = model('Order', OrderSchema) 