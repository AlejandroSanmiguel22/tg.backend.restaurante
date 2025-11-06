export interface Order {
  id: string
  tableId: string
  waiterId: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  tip: number
  total: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  productImage?: string | null
}

export type OrderStatus = 'en_cocina' | 'entregado' | 'facturada'

export interface OrderWithDetails extends Order {
  waiterName: string
  tableNumber: number
  items: OrderItemWithProduct[]
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string
    name: string
    description?: string
    image?: string
  }
} 