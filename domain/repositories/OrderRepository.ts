import { Order, OrderStatus } from '../entities/Order'

export interface OrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>
  findById(id: string): Promise<Order | null>
  findByTableId(tableId: string): Promise<Order[]>
  findActiveByTableId(tableId: string): Promise<Order | null>
  findByWaiterId(waiterId: string): Promise<Order[]>
  findByStatus(status: OrderStatus): Promise<Order[]>
  findActive(): Promise<Order[]>
  update(id: string, order: Partial<Order>): Promise<Order | null>
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>
  addItem(id: string, item: Order['items'][0]): Promise<Order | null>
  removeItem(id: string, itemId: string): Promise<Order | null>
  updateItem(id: string, itemId: string, item: Partial<Order['items'][0]>): Promise<Order | null>
  closeOrder(id: string): Promise<Order | null>
  delete(id: string): Promise<boolean>
  calculateTotals(id: string): Promise<{ subtotal: number; total: number }>
} 