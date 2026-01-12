import { Order, OrderStatus, OrderItem } from '../../domain/entities/Order'
import { OrderRepository } from '../../domain/repositories/OrderRepository'
import { OrderModel } from '../database/models/OrderModel'
import { productModel } from '../database/models/ProductModel'

export class OrderRepositoryMongo implements OrderRepository {
  async create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const newOrder = new OrderModel(order)
    const savedOrder = await newOrder.save()
    return this.mapToEntity(savedOrder)
  }

  async findById(id: string): Promise<Order | null> {
    const order = await OrderModel.findById(id)
    if (!order) return null
    
    const mappedOrder = this.mapToEntity(order)
    return await this.populateProductImages(mappedOrder)
  }

  async findByTableId(tableId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ tableId }).sort({ createdAt: -1 })
    const mappedOrders = orders.map(order => this.mapToEntity(order))
    
    // Poblar imágenes para cada orden
    const ordersWithImages = await Promise.all(
      mappedOrders.map(order => this.populateProductImages(order))
    )
    
    return ordersWithImages
  }

  async findActiveByTableId(tableId: string): Promise<Order | null> {
    const order = await OrderModel.findOne({ 
      tableId, 
      status: { $in: ['en_cocina', 'entregado'] } 
    })
    if (!order) return null
    
    const mappedOrder = this.mapToEntity(order)
    return await this.populateProductImages(mappedOrder)
  }

  async findByWaiterId(waiterId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ waiterId }).sort({ createdAt: -1 })
    return orders.map(this.mapToEntity)
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const orders = await OrderModel.find({ status }).sort({ createdAt: -1 })
    return orders.map(this.mapToEntity)
  }

  async findActive(): Promise<Order[]> {
    const orders = await OrderModel.find({ 
      status: { $in: ['en_cocina', 'entregado'] } 
    }).sort({ createdAt: -1 })
    
    const mappedOrders = orders.map(order => this.mapToEntity(order))
    
    // Poblar imágenes para cada orden
    const ordersWithImages = await Promise.all(
      mappedOrders.map(order => this.populateProductImages(order))
    )
    
    return ordersWithImages
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const orders = await OrderModel.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 })
    return orders.map(this.mapToEntity)
  }

  async findByWaiterAndDateRange(waiterId: string, startDate: Date, endDate: Date): Promise<Order[]> {
    const orders = await OrderModel.find({
      waiterId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 })
    return orders.map(this.mapToEntity)
  }

  async update(id: string, order: Partial<Order>): Promise<Order | null> {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { ...order, updatedAt: new Date() },
      { new: true }
    )
    return updatedOrder ? this.mapToEntity(updatedOrder) : null
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    )
    return updatedOrder ? this.mapToEntity(updatedOrder) : null
  }

  async addItem(id: string, item: OrderItem): Promise<Order | null> {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { 
        $push: { items: item },
        updatedAt: new Date()
      },
      { new: true }
    )
    if (!updatedOrder) return null
    
    const mappedOrder = this.mapToEntity(updatedOrder)
    return await this.populateProductImages(mappedOrder)
  }

  async removeItem(id: string, itemId: string): Promise<Order | null> {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { 
        $pull: { items: { _id: itemId } },
        updatedAt: new Date()
      },
      { new: true }
    )
    if (!updatedOrder) return null
    
    const mappedOrder = this.mapToEntity(updatedOrder)
    return await this.populateProductImages(mappedOrder)
  }

  async updateItem(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<Order | null> {
    try {
      // Si se actualiza la cantidad, necesitamos recalcular totalPrice
      if (updates.quantity) {
        const order = await OrderModel.findById(orderId)
        if (!order) return null
        
        const item = order.items.find(item => item.id === itemId)
        if (!item) return null
        
        updates.totalPrice = updates.quantity * item.unitPrice
      }

      const updateFields: any = {
        updatedAt: new Date()
      }

      // Construir campos de actualización para el item específico
      Object.keys(updates).forEach(key => {
        updateFields[`items.$.${key}`] = updates[key as keyof OrderItem]
      })

      const updatedOrder = await OrderModel.findOneAndUpdate(
        { 
          _id: orderId, 
          'items._id': itemId 
        },
        { 
          $set: updateFields
        },
        { new: true }
      )

      if (!updatedOrder) return null
      
      const mappedOrder = this.mapToEntity(updatedOrder)
      return await this.populateProductImages(mappedOrder)
    } catch (error) {
      console.error('Error updating order item:', error)
      return null
    }
  }

  async closeOrder(id: string): Promise<Order | null> {
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { 
        status: 'facturada',
        closedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    )
    return updatedOrder ? this.mapToEntity(updatedOrder) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(id)
    return !!result
  }

  async calculateTotals(id: string): Promise<{ subtotal: number; total: number }> {
    const order = await OrderModel.findById(id)
    if (!order) {
      throw new Error('Orden no encontrada')
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const tip = (subtotal * 10) / 100 // Tip constante del 10%
    const total = subtotal + tip

    return { subtotal, total }
  }

  private mapToEntity(order: any): Order {
    if (!order) {
      throw new Error('Orden no encontrada')
    }

    return {
      id: order._id?.toString() || '',
      tableId: order.tableId?.toString() || '',
      waiterId: order.waiterId?.toString() || '',
      status: order.status || 'en_cocina',
      items: (order.items || []).map((item: any) => ({
        id: item._id?.toString() || '',
        productId: item.productId?.toString() || '',
        productName: item.productName || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        notes: item.notes || '',
        productImage: item.productImage || null
      })),
      subtotal: order.subtotal || 0,
      tip: order.tip || 0,
      total: order.total || 0,
      notes: order.notes || '',
      createdAt: order.createdAt || new Date(),
      updatedAt: order.updatedAt || new Date(),
      closedAt: order.closedAt || undefined
    }
  }

  private async populateProductImages(order: Order): Promise<Order> {
    // Buscar todos los productIds únicos que no tienen imagen
    const productIdsWithoutImage = order.items
      .filter(item => !item.productImage)
      .map(item => item.productId)
    
    if (productIdsWithoutImage.length === 0) {
      return order // Todos los items ya tienen imagen
    }

    // Buscar los productos en la base de datos
    const products = await productModel.find({
      _id: { $in: productIdsWithoutImage }
    }).select('_id imageUrl')

    // Crear un mapa de productId -> imageUrl
    const productImageMap = new Map<string, string>()
    products.forEach(product => {
      productImageMap.set(product._id.toString(), product.imageUrl)
    })

    // Actualizar los items con las imágenes
    const updatedItems = order.items.map(item => ({
      ...item,
      productImage: item.productImage || productImageMap.get(item.productId) || null
    }))

    return {
      ...order,
      items: updatedItems
    }
  }
} 