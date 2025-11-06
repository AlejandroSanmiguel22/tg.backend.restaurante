import { OrderStatus } from '../../domain/entities/Order'

export interface CreateOrderDTO {
  tableId: string
  waiterId: string
  items: CreateOrderItemDTO[]
  notes?: string
}

export interface CreateOrderItemDTO {
  productId: string
  quantity: number
  notes?: string
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus
}

export interface AddOrderItemsDTO {
  items: CreateOrderItemDTO[]
}

export interface UpdateOrderItemDTO {
  quantity?: number
  notes?: string
}

export interface CloseOrderDTO {
  withTip: 'yes' | 'no'
}

export interface GenerateBillDTO {
  withTip: 'yes' | 'no'
}

export interface OrderResponseDTO {
  id: string
  tableId: string
  tableNumber: number
  waiterId: string
  waiterName: string
  status: OrderStatus
  items: OrderItemResponseDTO[]
  subtotal: number
  tip: number
  total: number
  notes: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date
}

export interface OrderItemResponseDTO {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string
  productImage?: string | null
}

export interface BillResponseDTO {
  orderId: string
  tableNumber: number
  waiterName: string
  items: OrderItemResponseDTO[]
  subtotal: number
  tip: number
  total: number
  tipPercentage: number
  createdAt: Date
  isPreBill: boolean
} 