import { RedisAdapter } from '../../infrastructure/adapters/RedisAdapter'
import { OrderRepository } from '../../domain/repositories/OrderRepository'
import { TableRepository } from '../../domain/repositories/TableRepository'
import { WaiterRepository } from '../../domain/repositories/WaiterRepository'
import { productRepository } from '../../domain/repositories/ProductRepository'
import { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import {
  TableMetricsDTO,
  RealTimeMetricsDTO,
  SalesMetricsDTO,
  WaiterPerformanceDTO,
  AllWaitersPerformanceDTO,
  ProductMetricsDTO,
  PeakHoursMetricsDTO,
  FinancialMetricsDTO,
  SalesReportDTO,
  WaiterReportDTO,
  ProductReportDTO
} from '../dtos/MetricsDTO'
import { METRICS_CACHE_TTL, REAL_TIME_CACHE_TTL } from '../config'
import { Order, OrderStatus } from '../../domain/entities/Order'
import { Table, TableStatus } from '../../domain/entities/Table'

export class MetricsService {
  constructor(
    private redis: RedisAdapter,
    private orderRepository: OrderRepository,
    private tableRepository: TableRepository,
    private waiterRepository: WaiterRepository,
    private productRepository: productRepository,
    private categoryRepository: CategoryRepository
  ) {}

  /**
   * Normaliza las fechas para incluir el día completo
   * startDate: inicio del día (00:00:00.000)
   * endDate: fin del día (23:59:59.999)
   */
  private normalizeDateRange(startDate: Date, endDate: Date): { start: Date; end: Date } {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return { start, end };
  }

  private async getFromCacheOrCalculate<T>(
    cacheKey: string,
    ttl: number,
    calculateFn: () => Promise<T>
  ): Promise<T & { fromCache: boolean; cacheKey: string; cacheTTL: number; calculatedAt: string }> {
    try {
      const cached = await this.redis.get(cacheKey)
      if (cached) {
        console.log(`Cache HIT para: ${cacheKey}`)
        const parsed = JSON.parse(cached)
        return {
          ...parsed,
          fromCache: true,
          cacheKey,
          cacheTTL: ttl,
          calculatedAt: new Date().toISOString()
        }
      }

      console.log(`Cache MISS para: ${cacheKey}`)
      const result = await calculateFn()
      const dataToCache = {
        ...result,
        calculatedAt: new Date().toISOString()
      }
      
      await this.redis.set(cacheKey, JSON.stringify(dataToCache), ttl)
      console.log(`Cache guardado para: ${cacheKey} (TTL: ${ttl}s)`)
      
      return {
        ...result,
        fromCache: false,
        cacheKey,
        cacheTTL: ttl,
        calculatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error en cache para ${cacheKey}:`, error)
      const result = await calculateFn()
      return {
        ...result,
        fromCache: false,
        cacheKey,
        cacheTTL: ttl,
        calculatedAt: new Date().toISOString()
      }
    }
  }

  // Métricas de Mesas
  async getTableMetrics(): Promise<TableMetricsDTO> {
    return this.getFromCacheOrCalculate(
      'metrics:tables',
      60, // 1 minuto
      async () => {
        const tables = await this.tableRepository.findAll()
        const occupiedTables = tables.filter(t => t.status === 'atendida').length
        
        return {
          totalTables: tables.length,
          occupiedTables,
          freeTables: tables.length - occupiedTables,
          tables: tables.map(t => ({
            id: t.id,
            number: t.number,
            status: t.status === 'atendida' ? 'attended' : 'free',
            currentOrder: undefined // La tabla base no tiene currentOrder
          }))
        }
      }
    )
  }

  // Métricas en Tiempo Real
  async getRealTimeMetrics(): Promise<RealTimeMetricsDTO> {
    return this.getFromCacheOrCalculate(
      'metrics:realtime',
      60, // 1 minuto
      async () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const orders = await this.orderRepository.findByDateRange(today, new Date())
        const tables = await this.tableRepository.findAll()
        const waiters = await this.waiterRepository.findAll()
        
        // Calcular top productos
        const productCounts = new Map<string, { quantity: number; totalSales: number; name: string }>()
        
        orders.forEach(order => {
          order.items.forEach(item => {
            const existing = productCounts.get(item.productId) || { quantity: 0, totalSales: 0, name: item.productName }
            existing.quantity += item.quantity
            existing.totalSales += item.totalPrice
            productCounts.set(item.productId, existing)
          })
        })
        
        const topProducts = Array.from(productCounts.entries())
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            totalSales: data.totalSales
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
        
        const todaySales = orders.reduce((sum, order) => sum + order.total, 0)
        const occupiedTables = tables.filter(t => t.status === 'atendida').length
        const activeWaiters = waiters.length // Simplificado por ahora
        
        return {
          todaySales,
          todayOrders: orders.length,
          topProducts,
          occupiedTables,
          activeWaiters
        }
      }
    )
  }

  // Métricas de Ventas por Período
  async getSalesMetrics(period: 'day' | 'week' | 'month', startDate: Date, endDate: Date): Promise<SalesMetricsDTO> {
    const cacheKey = `metrics:sales:${period}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const orders = await this.orderRepository.findByDateRange(start, end)
        
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTips = orders.reduce((sum, order) => sum + order.tip, 0)
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0
        
        // Agrupar por día
        const salesByDay = new Map<string, { sales: number; orders: number }>()
        orders.forEach(order => {
          const date = order.createdAt.toISOString().split('T')[0]
          const existing = salesByDay.get(date) || { sales: 0, orders: 0 }
          existing.sales += order.total
          existing.orders += 1
          salesByDay.set(date, existing)
        })
        
        return {
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalOrders: orders.length,
          totalTips,
          averageOrderValue,
          salesByDay: Array.from(salesByDay.entries()).map(([date, data]) => ({
            date,
            sales: data.sales,
            orders: data.orders
          }))
        }
      }
    )
  }

  // Rendimiento por Mesero
  async getWaiterPerformance(waiterId: string, startDate: Date, endDate: Date): Promise<WaiterPerformanceDTO> {
    const cacheKey = `metrics:waiter:${waiterId}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const waiter = await this.waiterRepository.findById(waiterId)
        if (!waiter) {
          throw new Error('Mesero no encontrado')
        }
        
        const orders = await this.orderRepository.findByWaiterAndDateRange(waiterId, start, end)
        
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTips = orders.reduce((sum, order) => sum + order.tip, 0)
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0
        
        // Agrupar por día
        const ordersByDay = new Map<string, { orders: number; sales: number }>()
        orders.forEach(order => {
          const date = order.createdAt.toISOString().split('T')[0]
          const existing = ordersByDay.get(date) || { orders: 0, sales: 0 }
          existing.orders += 1
          existing.sales += order.total
          ordersByDay.set(date, existing)
        })
        
        return {
          waiterId,
          waiterName: `${waiter.firstName} ${waiter.lastName}`,
          totalOrders: orders.length,
          totalSales,
          averageOrderValue,
          ordersByDay: Array.from(ordersByDay.entries()).map(([date, data]) => ({
            date,
            orders: data.orders,
            sales: data.sales
          }))
        }
      }
    )
  }

  // Rendimiento de Todos los Meseros
  async getAllWaitersPerformance(startDate: Date, endDate: Date): Promise<AllWaitersPerformanceDTO> {
    const cacheKey = `metrics:allwaiters:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const waiters = await this.waiterRepository.findAll()
        const allOrders = await this.orderRepository.findByDateRange(start, end)
        
        // Calcular métricas para cada mesero
        const waitersPerformance = await Promise.all(
          waiters.map(async (waiter) => {
            const waiterOrders = allOrders.filter(order => order.waiterId === waiter.id)
            
            const totalSales = waiterOrders.reduce((sum, order) => sum + order.total, 0)
            const averageOrderValue = waiterOrders.length > 0 ? totalSales / waiterOrders.length : 0
            
            // Agrupar por día para este mesero
            const ordersByDay = new Map<string, { orders: number; sales: number }>()
            waiterOrders.forEach(order => {
              const date = order.createdAt.toISOString().split('T')[0]
              const existing = ordersByDay.get(date) || { orders: 0, sales: 0 }
              existing.orders += 1
              existing.sales += order.total
              ordersByDay.set(date, existing)
            })
            
            return {
              waiterId: waiter.id,
              waiterName: `${waiter.firstName} ${waiter.lastName}`,
              totalOrders: waiterOrders.length,
              totalSales,
              averageOrderValue,
              percentageOfTotalSales: 0, // Se calculará después
              ordersByDay: Array.from(ordersByDay.entries()).map(([date, data]) => ({
                date,
                orders: data.orders,
                sales: data.sales
              }))
            }
          })
        )
        
        // Calcular totales generales
        const totalSales = waitersPerformance.reduce((sum, waiter) => sum + waiter.totalSales, 0)
        const totalOrders = waitersPerformance.reduce((sum, waiter) => sum + waiter.totalOrders, 0)
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
        
        // Calcular porcentajes de ventas totales para cada mesero
        const waitersWithPercentages = waitersPerformance.map(waiter => ({
          ...waiter,
          percentageOfTotalSales: totalSales > 0 ? (waiter.totalSales / totalSales) * 100 : 0
        }))
        
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalWaiters: waiters.length,
          totalSales,
          totalOrders,
          averageOrderValue,
          waiters: waitersWithPercentages
        }
      }
    )
  }

  // Productos más vendidos
  async getProductMetrics(period: 'week' | 'month', startDate: Date, endDate: Date): Promise<ProductMetricsDTO> {
    const cacheKey = `metrics:products:${period}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const orders = await this.orderRepository.findByDateRange(start, end)
        const categories = await this.categoryRepository.findAll()
        
        // Calcular métricas de productos
        const productCounts = new Map<string, { quantity: number; totalSales: number; name: string; categoryId: string }>()
        const categoryCounts = new Map<string, { totalSales: number; totalQuantity: number; name: string }>()
        
        orders.forEach(order => {
          order.items.forEach(item => {
            // Producto
            const existingProduct = productCounts.get(item.productId) || { 
              quantity: 0, 
              totalSales: 0, 
              name: item.productName,
              categoryId: '' // Los items no tienen categoryId, necesitaríamos obtenerlo del producto
            }
            existingProduct.quantity += item.quantity
            existingProduct.totalSales += item.totalPrice
            productCounts.set(item.productId, existingProduct)
            
            // Categoría - simplificado por ahora
            const categoryId = 'sin-categoria'
            const existingCategory = categoryCounts.get(categoryId) || { 
              totalSales: 0, 
              totalQuantity: 0, 
              name: 'Sin Categoría'
            }
            existingCategory.totalSales += item.totalPrice
            existingCategory.totalQuantity += item.quantity
            categoryCounts.set(categoryId, existingCategory)
          })
        })
        
        const totalSales = Array.from(productCounts.values()).reduce((sum, p) => sum + p.totalSales, 0)
        
        const topProducts = Array.from(productCounts.entries())
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            category: 'Sin Categoría', // Simplificado
            quantity: data.quantity,
            totalSales: data.totalSales,
            percentageOfTotal: totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10)
        
        const categoryBreakdown = Array.from(categoryCounts.entries())
          .map(([categoryId, data]) => ({
            category: data.name,
            totalSales: data.totalSales,
            totalQuantity: data.totalQuantity,
            percentageOfTotal: totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0
          }))
          .sort((a, b) => b.totalSales - a.totalSales)
        
        return {
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          topProducts,
          categoryBreakdown
        }
      }
    )
  }

  // Horarios pico
  async getPeakHoursMetrics(date: Date): Promise<PeakHoursMetricsDTO> {
    const cacheKey = `metrics:peakhours:${date.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        const orders = await this.orderRepository.findByDateRange(startOfDay, endOfDay)
        
        // Agrupar por hora
        const hourlyActivity = new Array(24).fill(0).map((_, hour) => ({
          hour,
          orders: 0,
          sales: 0
        }))
        
        orders.forEach(order => {
          const hour = order.createdAt.getHours()
          hourlyActivity[hour].orders += 1
          hourlyActivity[hour].sales += order.total
        })
        
        // Determinar horarios pico
        const totalOrders = orders.length
        const averageOrdersPerHour = totalOrders / 24
        
        const peakHours = hourlyActivity.map(activity => {
          let activityLevel: 'low' | 'medium' | 'high'
          if (activity.orders === 0) activityLevel = 'low'
          else if (activity.orders <= averageOrdersPerHour) activityLevel = 'medium'
          else activityLevel = 'high'
          
          return {
            hour: activity.hour,
            activity: activityLevel
          }
        })
        
        return {
          date: date.toISOString().split('T')[0],
          hourlyActivity,
          peakHours
        }
      }
    )
  }

  // Métricas Financieras
  async getFinancialMetrics(period: 'day' | 'week' | 'month', startDate: Date, endDate: Date): Promise<FinancialMetricsDTO> {
    const cacheKey = `metrics:financial:${period}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const orders = await this.orderRepository.findByDateRange(start, end)
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTips = orders.reduce((sum, order) => sum + order.tip, 0)
        const averageTipPercentage = totalRevenue > 0 ? (totalTips / totalRevenue) * 100 : 0
        
        // Agrupar por día
        const revenueByDay = new Map<string, { revenue: number; tips: number }>()
        orders.forEach(order => {
          const date = order.createdAt.toISOString().split('T')[0]
          const existing = revenueByDay.get(date) || { revenue: 0, tips: 0 }
          existing.revenue += order.total
          existing.tips += order.tip
          revenueByDay.set(date, existing)
        })
        
        return {
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalRevenue,
          totalTips,
          averageTipPercentage,
          revenueByDay: Array.from(revenueByDay.entries()).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            tips: data.tips
          }))
        }
      }
    )
  }

  // Métodos para invalidar cache cuando se actualizan datos
  async invalidateTableMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas de mesas`)
    await this.redis.del('metrics:tables')
  }

  async invalidateRealTimeMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas en tiempo real`)
    await this.redis.del('metrics:realtime')
  }

  async invalidateSalesMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas de ventas`)
    // Invalidar todas las métricas de ventas
    await this.redis.del('metrics:sales:*')
  }

  async invalidateWaiterMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas de meseros`)
    // Invalidar todas las métricas de meseros
    await this.redis.del('metrics:waiter:*')
    await this.redis.del('metrics:allwaiters:*')
  }

  async invalidateProductMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas de productos`)
    // Invalidar todas las métricas de productos
    await this.redis.del('metrics:products:*')
    await this.redis.del('metrics:mostsold:*')
    await this.redis.del('metrics:leastsold:*')
  }

  async invalidatePeakHoursMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas de horarios pico`)
    // Invalidar métricas de horarios pico
    await this.redis.del('metrics:peakhours:*')
  }

  async invalidateFinancialMetrics(): Promise<void> {
    console.log(`Invalidando cache de métricas financieras`)
    // Invalidar métricas financieras
    await this.redis.del('metrics:financial:*')
  }

  async invalidateAllMetrics(): Promise<void> {
    console.log(`Invalidando TODAS las métricas del cache`)
    // Invalidar todas las métricas
    await this.redis.del('metrics:tables')
    await this.redis.del('metrics:realtime')
    await this.redis.del('metrics:sales:*')
    await this.redis.del('metrics:waiter:*')
    await this.redis.del('metrics:allwaiters:*')
    await this.redis.del('metrics:products:*')
    await this.redis.del('metrics:mostsold:*')
    await this.redis.del('metrics:leastsold:*')
    await this.redis.del('metrics:peakhours:*')
    await this.redis.del('metrics:financial:*')
    await this.redis.del('metrics:report:*')
  }

  async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportDTO> {
    const cacheKey = `metrics:report:sales:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const orders = await this.orderRepository.findByDateRange(start, end)
        const waiters = await this.waiterRepository.findAll()
        
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTips = orders.reduce((sum, order) => sum + order.tip, 0)
        
        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const waiter = waiters.find(w => w.id === order.waiterId)
            const table = await this.tableRepository.findById(order.tableId)
            
            return {
              id: order.id,
              tableNumber: table?.number || 0,
              waiterName: waiter ? `${waiter.firstName} ${waiter.lastName}` : 'Desconocido',
              total: order.total,
              tip: order.tip,
              status: order.status,
              createdAt: order.createdAt.toISOString(),
              products: order.items.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                price: item.unitPrice,
                subtotal: item.totalPrice
              }))
            }
          })
        )
        
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalOrders: orders.length,
          totalTips,
          orders: ordersWithDetails
        }
      }
    )
  }

  async getWaiterReport(waiterId: string, startDate: Date, endDate: Date): Promise<WaiterReportDTO> {
    const cacheKey = `metrics:report:waiter:${waiterId}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const waiter = await this.waiterRepository.findById(waiterId)
        if (!waiter) {
          throw new Error('Mesero no encontrado')
        }
        
        const orders = await this.orderRepository.findByWaiterAndDateRange(waiterId, start, end)
        
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
        const totalTips = orders.reduce((sum, order) => sum + order.tip, 0)
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0
        
        const ordersWithDetails = await Promise.all(
          orders.map(async (order) => {
            const table = await this.tableRepository.findById(order.tableId)
            
            return {
              id: order.id,
              tableNumber: table?.number || 0,
              total: order.total,
              tip: order.tip,
              status: order.status,
              createdAt: order.createdAt.toISOString()
            }
          })
        )
        
        return {
          waiterId,
          waiterName: `${waiter.firstName} ${waiter.lastName}`,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalOrders: orders.length,
          totalSales,
          totalTips,
          averageOrderValue,
          orders: ordersWithDetails
        }
      }
    )
  }

  async getProductReport(startDate: Date, endDate: Date): Promise<ProductReportDTO> {
    const cacheKey = `metrics:report:products:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    
    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        const orders = await this.orderRepository.findByDateRange(start, end)
        const categories = await this.categoryRepository.findAll()
        
        // Agrupar productos por categoría
        const categoryData = new Map<string, {
          name: string
          totalSales: number
          totalQuantity: number
          products: Map<string, { quantity: number; totalSales: number; name: string }>
        }>()
        
        orders.forEach(order => {
          order.items.forEach(item => {
            const categoryId = 'sin-categoria' // Simplificado
            const categoryName = 'Sin Categoría'
            
            let category = categoryData.get(categoryId)
            if (!category) {
              category = {
                name: categoryName,
                totalSales: 0,
                totalQuantity: 0,
                products: new Map()
              }
              categoryData.set(categoryId, category)
            }
            
            category.totalSales += item.totalPrice
            category.totalQuantity += item.quantity
            
            let productData = category.products.get(item.productId)
            if (!productData) {
              productData = { quantity: 0, totalSales: 0, name: item.productName }
            }
            productData.quantity += item.quantity
            productData.totalSales += item.totalPrice
            category.products.set(item.productId, productData)
          })
        })
        
        const totalSales = Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.totalSales, 0)
        const totalProducts = Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.products.size, 0)
        
        const categoriesArray = Array.from(categoryData.entries()).map(([categoryId, category]) => ({
          name: category.name,
          totalSales: category.totalSales,
          totalQuantity: category.totalQuantity,
          products: Array.from(category.products.entries()).map(([productId, product]) => ({
            id: productId,
            name: product.name,
            quantity: product.quantity,
            totalSales: product.totalSales,
            averagePrice: product.quantity > 0 ? product.totalSales / product.quantity : 0
          })).sort((a, b) => b.quantity - a.quantity)
        }))
        
        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalSales,
          totalProducts,
          categories: categoriesArray
        }
      }
    )
  }

  /**
   * Retorna el producto más vendido en el rango de fechas (con cache)
   */
  async getMostSoldProduct(startDate: Date, endDate: Date): Promise<{ name: string; imageUrl: string; totalSold: number } | null> {
    const cacheKey = `metrics:mostsold:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    const result = await this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        console.log(`Calculando producto más vendido para rango: ${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`)
        const orders = await this.orderRepository.findByDateRange(start, end)
        console.log(`Órdenes encontradas: ${orders.length}`)
        
        const productCounts = new Map<string, number>()
        orders.forEach(order => {
          order.items.forEach(item => {
            productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity)
          })
        })
        
        console.log(`Productos únicos encontrados: ${productCounts.size}`)
        if (productCounts.size === 0) {
          console.log('No hay productos vendidos en el rango de fechas')
          return { product: null }
        }
        
        // Ordenar productos por cantidad vendida (descendente)
        const sortedProducts = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1])
        
        // Buscar el primer producto que existe en la base de datos
        for (const [productId, totalSold] of sortedProducts) {
          console.log(`Verificando producto ID: ${productId}, cantidad: ${totalSold}`)
          const product = await this.productRepository.findById(productId)
          
          if (product) {
            console.log(`Producto encontrado: ${product.name}`)
            return { 
              product: { 
                name: product.name, 
                imageUrl: product.imageUrl, 
                totalSold 
              } 
            }
          } else {
            console.log(`Producto con ID ${productId} no encontrado en la base de datos`)
          }
        }
        
        console.log('Ninguno de los productos vendidos existe en la base de datos')
        return { product: null }
      }
    )
    
    // Extraer solo el producto del resultado del cache
    return (result as any).product || null
  }

  /**
   * Retorna el producto menos vendido en el rango de fechas (con cache)
   */
  async getLeastSoldProduct(startDate: Date, endDate: Date): Promise<{ name: string; imageUrl: string; totalSold: number } | null> {
    const cacheKey = `metrics:leastsold:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`
    const result = await this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const { start, end } = this.normalizeDateRange(startDate, endDate)
        console.log(`Calculando producto menos vendido para rango: ${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`)
        const orders = await this.orderRepository.findByDateRange(start, end)
        console.log(`Órdenes encontradas: ${orders.length}`)
        
        const productCounts = new Map<string, number>()
        orders.forEach(order => {
          order.items.forEach(item => {
            productCounts.set(item.productId, (productCounts.get(item.productId) || 0) + item.quantity)
          })
        })
        
        console.log(`Productos únicos encontrados: ${productCounts.size}`)
        if (productCounts.size === 0) {
          console.log('No hay productos vendidos en el rango de fechas')
          return { product: null }
        }
        
        // Ordenar productos por cantidad vendida (ascendente)
        const sortedProducts = Array.from(productCounts.entries()).sort((a, b) => a[1] - b[1])
        
        // Buscar el primer producto que existe en la base de datos
        for (const [productId, totalSold] of sortedProducts) {
          console.log(`Verificando producto ID: ${productId}, cantidad: ${totalSold}`)
          const product = await this.productRepository.findById(productId)
          
          if (product) {
            console.log(`Producto encontrado: ${product.name}`)
            return { 
              product: { 
                name: product.name, 
                imageUrl: product.imageUrl, 
                totalSold 
              } 
            }
          } else {
            console.log(`Producto con ID ${productId} no encontrado en la base de datos`)
          }
        }
        
        console.log('Ninguno de los productos vendidos existe en la base de datos')
        return { product: null }
      }
    )
    
    // Extraer solo el producto del resultado del cache
    return (result as any).product || null
  }

  // Flujo de atención por franja horaria (7am - 7pm)
  async getHourlyFlowMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<import("../dtos/MetricsDTO").HourlyFlowMetricsDTO> {
    const cacheKey = `metrics:hourlyflow:${
      startDate.toISOString().split("T")[0]
    }:${endDate.toISOString().split("T")[0]}`;

    return this.getFromCacheOrCalculate(
      cacheKey,
      300, // 5 minutos
      async () => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const orders = await this.orderRepository.findByDateRange(start, end);

        const START_HOUR = 7; // 7:00
        const END_HOUR = 19; // 19:00

        // Inicializar estructura para horas de 7:00 a 19:00 (formato 24h)
        const hourlyFlow: Array<{
          hour: number;
          hourLabel: string;
          ordersCount: number;
          customersServed: number;
        }> = [];

        for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
          const hourLabel = `${hour.toString().padStart(2, "0")}:00`;

          hourlyFlow.push({
            hour,
            hourLabel,
            ordersCount: 0,
            customersServed: 0,
          });
        }

        // Contar órdenes por hora dentro del rango (acumulado de todos los días)
        orders.forEach((order) => {
          const orderHour = order.createdAt.getHours();
          if (orderHour >= START_HOUR && orderHour <= END_HOUR) {
            const index = orderHour - START_HOUR;
            hourlyFlow[index].ordersCount += 1;
            // Estimamos clientes atendidos basado en items de la orden
            hourlyFlow[index].customersServed += order.items.length > 3 ? 2 : 1;
          }
        });

        // Calcular total y hora pico
        const totalOrdersInRange = hourlyFlow.reduce(
          (sum, h) => sum + h.ordersCount,
          0
        );
        const peakHourData = hourlyFlow.reduce(
          (max, current) =>
            current.ordersCount > max.ordersCount ? current : max,
          hourlyFlow[0]
        );

        return {
          date: `${startDate.toISOString().split("T")[0]} - ${
            endDate.toISOString().split("T")[0]
          }`,
          startHour: START_HOUR,
          endHour: END_HOUR,
          hourlyFlow,
          totalOrdersInRange,
          peakHour: peakHourData.hour,
          peakHourLabel: peakHourData.hourLabel,
        };
      }
    );
  }
}
