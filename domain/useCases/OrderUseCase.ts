import { OrderRepository } from '../repositories/OrderRepository'
import { TableRepository } from '../repositories/TableRepository'
import { productRepository } from '../repositories/ProductRepository'
import { WaiterRepository } from '../repositories/WaiterRepository'
import { 
  CreateOrderDTO, 
  UpdateOrderStatusDTO,
  AddOrderItemsDTO,
  UpdateOrderItemDTO,
  CloseOrderDTO,
  GenerateBillDTO
} from '../../application/dtos/OrderDTO'
import { Order, OrderStatus, OrderItem } from '../entities/Order'
import { TableStatus } from '../entities/Table'

export class OrderUseCase {
  private readonly TIP_PERCENTAGE = 3 // Tip constante del 3%

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tableRepository: TableRepository,
    private readonly productRepository: productRepository,
    private readonly waiterRepository: WaiterRepository
  ) {}

  async create(createOrderDTO: CreateOrderDTO): Promise<Order> {
    // Verificar que la mesa existe y esté libre
    const table = await this.tableRepository.findById(createOrderDTO.tableId)
    if (!table) {
      throw new Error('Mesa no encontrada')
    }
    if (table.status !== 'libre') {
      throw new Error('La mesa no está disponible')
    }

    // Verificar que el mesero existe
    const waiter = await this.waiterRepository.findById(createOrderDTO.waiterId)
    if (!waiter) {
      throw new Error('Mesero no encontrado')
    }

    // Verificar que no haya una orden activa en la mesa
    const activeOrder = await this.orderRepository.findActiveByTableId(createOrderDTO.tableId)
    if (activeOrder) {
      throw new Error('Ya existe una orden activa en esta mesa')
    }

    // Procesar los items y calcular totales
    const items: OrderItem[] = []
    let subtotal = 0

    for (const itemDTO of createOrderDTO.items) {
      const product = await this.productRepository.findById(itemDTO.productId)
      if (!product) {
        throw new Error(`Producto con ID ${itemDTO.productId} no encontrado`)
      }
      if (!product.isActive) {
        throw new Error(`Producto ${product.name} no está disponible`)
      }

      const totalPrice = product.price * itemDTO.quantity
      subtotal += totalPrice

      items.push({
        id: '', // Se generará automáticamente
        productId: product.id,
        productName: product.name,
        quantity: itemDTO.quantity,
        unitPrice: product.price,
        totalPrice,
        notes: itemDTO.notes || ''
      })
    }

    // Calcular tip constante del 3%
    const tip = (subtotal * this.TIP_PERCENTAGE) / 100
    const total = subtotal + tip

    // Crear la orden
    const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      tableId: createOrderDTO.tableId,
      waiterId: createOrderDTO.waiterId,
      status: 'en_cocina',
      items,
      subtotal,
      tip,
      total,
      notes: createOrderDTO.notes || ''
    }

    const newOrder = await this.orderRepository.create(order)

    // Actualizar el estado de la mesa a 'atendida'
    await this.tableRepository.updateStatus(createOrderDTO.tableId, 'atendida')

    return newOrder
  }

  async findById(id: string): Promise<Order | null> {
    return await this.orderRepository.findById(id)
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    return await this.orderRepository.findByTableId(tableId)
  }

  async findActiveByTableId(tableId: string): Promise<Order | null> {
    return await this.orderRepository.findActiveByTableId(tableId)
  }

  async findByWaiterId(waiterId: string): Promise<Order[]> {
    return await this.orderRepository.findByWaiterId(waiterId)
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.findByStatus(status)
  }

  async findActive(): Promise<Order[]> {
    return await this.orderRepository.findActive()
  }

  async updateStatus(id: string, updateStatusDTO: UpdateOrderStatusDTO): Promise<Order | null> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status === 'facturada') {
      throw new Error('No se puede cambiar el estado de una orden facturada')
    }

    return await this.orderRepository.updateStatus(id, updateStatusDTO.status)
  }

  async addItems(id: string, addItemsDTO: AddOrderItemsDTO): Promise<Order | null> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status === 'facturada') {
      throw new Error('No se puede modificar una orden facturada')
    }

    // Procesar cada item
    for (const itemDTO of addItemsDTO.items) {
      const product = await this.productRepository.findById(itemDTO.productId)
      if (!product) {
        throw new Error(`Producto con ID ${itemDTO.productId} no encontrado`)
      }
      if (!product.isActive) {
        throw new Error(`Producto ${product.name} no está disponible`)
      }

      const totalPrice = product.price * itemDTO.quantity
      const newItem: OrderItem = {
        id: '', // Se generará automáticamente
        productId: product.id,
        productName: product.name,
        quantity: itemDTO.quantity,
        unitPrice: product.price,
        totalPrice,
        notes: itemDTO.notes || ''
      }

      await this.orderRepository.addItem(id, newItem)
    }

    // Obtener la orden actualizada y recalcular totales
    const updatedOrder = await this.orderRepository.findById(id)
    if (updatedOrder) {
      const { subtotal, total } = await this.orderRepository.calculateTotals(id)
      const tip = (subtotal * this.TIP_PERCENTAGE) / 100
      await this.orderRepository.update(id, { 
        subtotal, 
        tip,
        total
      })
    }

    return updatedOrder
  }

  async removeItem(id: string, itemId: string): Promise<Order | null> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status === 'facturada') {
      throw new Error('No se puede modificar una orden facturada')
    }

    const updatedOrder = await this.orderRepository.removeItem(id, itemId)
    
    // Recalcular totales después de eliminar
    if (updatedOrder) {
      const { subtotal, total } = await this.orderRepository.calculateTotals(id)
      const tip = (subtotal * this.TIP_PERCENTAGE) / 100
      await this.orderRepository.update(id, { 
        subtotal, 
        tip,
        total
      })
      
      // Retornar la orden actualizada con los nuevos totales
      return await this.orderRepository.findById(id)
    }

    return updatedOrder
  }

  async updateItem(id: string, itemId: string, updates: Partial<OrderItem>): Promise<Order | null> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status === 'facturada') {
      throw new Error('No se puede modificar una orden facturada')
    }

    const updatedOrder = await this.orderRepository.updateItem(id, itemId, updates)
    
    // Recalcular totales después de actualizar
    if (updatedOrder) {
      const { subtotal, total } = await this.orderRepository.calculateTotals(id)
      const tip = (subtotal * this.TIP_PERCENTAGE) / 100
      await this.orderRepository.update(id, { 
        subtotal, 
        tip,
        total
      })
      
      // Retornar la orden actualizada con los nuevos totales
      return await this.orderRepository.findById(id)
    }

    return updatedOrder
  }

  async closeOrder(id: string): Promise<Order | null> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status === 'facturada') {
      throw new Error('La orden ya está facturada')
    }

    // Recalcular tip y total con el porcentaje constante del 3%
    const tip = (existingOrder.subtotal * this.TIP_PERCENTAGE) / 100
    const total = existingOrder.subtotal + tip

    // Actualizar propina y total
    await this.orderRepository.update(id, { tip, total })
    
    // Cerrar la orden
    const closedOrder = await this.orderRepository.closeOrder(id)

    // Liberar la mesa
    if (closedOrder) {
      await this.tableRepository.updateStatus(closedOrder.tableId, 'libre')
    }

    return closedOrder
  }

  async generateBill(id: string, generateBillDTO: GenerateBillDTO): Promise<any> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    // Obtener información de la mesa y el mesero
    const table = await this.tableRepository.findById(existingOrder.tableId)
    const waiter = await this.waiterRepository.findById(existingOrder.waiterId)
    
    if (!table || !waiter) {
      throw new Error('Información de mesa o mesero no encontrada')
    }

    let tip = 0
    let total = existingOrder.subtotal

    if (generateBillDTO.withTip === 'yes') {
      // Calcular tip con el porcentaje constante del 3%
      tip = (existingOrder.subtotal * this.TIP_PERCENTAGE) / 100
      total = existingOrder.subtotal + tip
    }

    return {
      orderId: existingOrder.id,
      tableNumber: table.number,
      waiterName: `${waiter.firstName} ${waiter.lastName}`,
      items: existingOrder.items,
      subtotal: existingOrder.subtotal,
      tip,
      total,
      tipPercentage: generateBillDTO.withTip === 'yes' ? this.TIP_PERCENTAGE : 0,
      createdAt: existingOrder.createdAt,
      isPreBill: existingOrder.status !== 'facturada'
    }
  }

  async delete(id: string): Promise<boolean> {
    const existingOrder = await this.orderRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Orden no encontrada')
    }

    if (existingOrder.status !== 'facturada') {
      throw new Error('Solo se pueden eliminar órdenes facturadas')
    }

    return await this.orderRepository.delete(id)
  }
} 