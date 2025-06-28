import { Request, Response } from 'express'
import { OrderUseCase } from '../../domain/useCases/OrderUseCase'
import { OrderRepository } from '../../domain/repositories/OrderRepository'
import { TableRepository } from '../../domain/repositories/TableRepository'
import { productRepository } from '../../domain/repositories/ProductRepository'
import { WaiterRepository } from '../../domain/repositories/WaiterRepository'
import { 
  CreateOrderDTO, 
  UpdateOrderStatusDTO,
  AddOrderItemsDTO,
  UpdateOrderItemDTO,
  CloseOrderDTO,
  GenerateBillDTO
} from '../../application/dtos/OrderDTO'
import { OrderItem } from '../../domain/entities/Order'

export class OrderController {
  private orderUseCase: OrderUseCase

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly tableRepository: TableRepository,
    private readonly productRepository: productRepository,
    private readonly waiterRepository: WaiterRepository
  ) {
    this.orderUseCase = new OrderUseCase(
      orderRepository,
      tableRepository,
      productRepository,
      waiterRepository
    )
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const createOrderDTO: CreateOrderDTO = req.body
      const order = await this.orderUseCase.create(createOrderDTO)
      
      res.status(201).json({
        message: 'Orden creada correctamente',
        data: order
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al crear la orden'
      })
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const order = await this.orderUseCase.findById(id)
      
      if (!order) {
        res.status(404).json({
          message: 'Orden no encontrada'
        })
        return
      }

      res.status(200).json({
        data: order
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener la orden'
      })
    }
  }

  async findByTableId(req: Request, res: Response): Promise<void> {
    try {
      const { tableId } = req.params
      const orders = await this.orderUseCase.findByTableId(tableId)
      
      res.status(200).json({
        data: orders
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las órdenes de la mesa'
      })
    }
  }

  async findActiveByTableId(req: Request, res: Response): Promise<void> {
    try {
      const { tableId } = req.params
      const order = await this.orderUseCase.findActiveByTableId(tableId)
      
      if (!order) {
        res.status(404).json({
          message: 'No hay orden activa en esta mesa'
        })
        return
      }

      res.status(200).json({
        data: order
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener la orden activa'
      })
    }
  }

  async findByWaiterId(req: Request, res: Response): Promise<void> {
    try {
      const { waiterId } = req.params
      const orders = await this.orderUseCase.findByWaiterId(waiterId)
      
      res.status(200).json({
        data: orders
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las órdenes del mesero'
      })
    }
  }

  async findByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params
      if (!['en_cocina', 'entregado', 'facturada'].includes(status)) {
        res.status(400).json({
          message: 'Estado inválido'
        })
        return
      }

      const orders = await this.orderUseCase.findByStatus(status as any)
      res.status(200).json({
        data: orders
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las órdenes'
      })
    }
  }

  async findActive(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderUseCase.findActive()
      res.status(200).json({
        data: orders
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener las órdenes activas'
      })
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateStatusDTO: UpdateOrderStatusDTO = req.body
      
      if (!['en_cocina', 'entregado', 'facturada'].includes(updateStatusDTO.status)) {
        res.status(400).json({
          message: 'Estado inválido'
        })
        return
      }

      const updatedOrder = await this.orderUseCase.updateStatus(id, updateStatusDTO)
      
      if (!updatedOrder) {
        res.status(404).json({
          message: 'Orden no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Estado de orden actualizado correctamente',
        data: updatedOrder
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al actualizar el estado'
      })
    }
  }

  async addItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const addItemsDTO: AddOrderItemsDTO = req.body
      
      const updatedOrder = await this.orderUseCase.addItems(id, addItemsDTO)
      
      if (!updatedOrder) {
        res.status(404).json({
          message: 'Orden no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Productos agregados correctamente',
        data: updatedOrder
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al agregar productos'
      })
    }
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params
      
      const updatedOrder = await this.orderUseCase.removeItem(id, itemId)
      
      if (!updatedOrder) {
        res.status(404).json({
          message: 'Orden o item no encontrado'
        })
        return
      }

      res.status(200).json({
        message: 'Producto eliminado correctamente',
        data: updatedOrder
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar producto'
      })
    }
  }

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id, itemId } = req.params
      const { quantity, notes } = req.body

      const updates: Partial<OrderItem> = {}
      if (quantity !== undefined) updates.quantity = quantity
      if (notes !== undefined) updates.notes = notes

      const updatedOrder = await this.orderUseCase.updateItem(id, itemId, updates)

      if (!updatedOrder) {
        res.status(404).json({ message: 'Orden o item no encontrado' })
        return
      }

      res.json({
        message: 'Producto actualizado correctamente',
        data: updatedOrder
      })
    } catch (error) {
      console.error('Error updating order item:', error)
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error interno del servidor' 
      })
    }
  }

  async closeOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      
      const closedOrder = await this.orderUseCase.closeOrder(id)
      
      if (!closedOrder) {
        res.status(404).json({
          message: 'Orden no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Orden cerrada correctamente con factura',
        data: closedOrder
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al cerrar la orden'
      })
    }
  }

  async generateBill(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const generateBillDTO: GenerateBillDTO = req.body
      
      if (!generateBillDTO.withTip || !['yes', 'no'].includes(generateBillDTO.withTip)) {
        res.status(400).json({
          message: 'El campo withTip es requerido y debe ser "yes" o "no"'
        })
        return
      }

      const bill = await this.orderUseCase.generateBill(id, generateBillDTO)

      res.status(200).json({
        message: 'Factura generada correctamente',
        data: bill
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al generar la factura'
      })
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const success = await this.orderUseCase.delete(id)
      
      if (!success) {
        res.status(404).json({
          message: 'Orden no encontrada'
        })
        return
      }

      res.status(200).json({
        message: 'Orden eliminada correctamente'
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Error al eliminar la orden'
      })
    }
  }
} 