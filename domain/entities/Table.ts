import { OrderStatus } from './Order'

export interface Table {
  id: string
  number: number
  status: TableStatus
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type TableStatus = 'libre' | 'atendida'

export interface TableWithOrder extends Table {
  currentOrder?: {
    id: string
    waiterName: string
    status: OrderStatus
    total: number
    createdAt: Date
  }
} 