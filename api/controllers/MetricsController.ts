import { Request, Response } from 'express'
import { MetricsService } from '../../application/services/MetricsService'
import { OrderRepositoryMongo } from '../../infrastructure/repositories/OrderRepositoryMongo'
import { TableRepositoryMongo } from '../../infrastructure/repositories/TableRepositoryMongo'
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo'
import { productRepositoryMongo } from '../../infrastructure/repositories/ProductRepositoryMongo'
import { CategoryRepositoryMongo } from '../../infrastructure/repositories/CategoryRepositoryMongo'

export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  // Métricas de Mesas
  async getTableMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getTableMetrics()
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas de mesas:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Métricas en Tiempo Real
  async getRealTimeMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.metricsService.getRealTimeMetrics()
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas en tiempo real:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Métricas de Ventas por Período
  async getSalesMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate } = req.query
      
      if (!period || !startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: period, startDate, endDate' 
        })
        return
      }

      if (!['day', 'week', 'month'].includes(period as string)) {
        res.status(400).json({ 
          error: 'El período debe ser: day, week, o month' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const metrics = await this.metricsService.getSalesMetrics(
        period as 'day' | 'week' | 'month',
        start,
        end
      )
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas de ventas:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Rendimiento por Mesero
  async getWaiterPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { waiterId, startDate, endDate } = req.query
      
      if (!waiterId || !startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: waiterId, startDate, endDate' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const metrics = await this.metricsService.getWaiterPerformance(
        waiterId as string,
        start,
        end
      )
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo rendimiento del mesero:', error)
      if (error instanceof Error && error.message === 'Mesero no encontrado') {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Error interno del servidor' })
      }
    }
  }

  // Productos más vendidos
  async getProductMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate } = req.query
      
      if (!period || !startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: period, startDate, endDate' 
        })
        return
      }

      if (!['week', 'month'].includes(period as string)) {
        res.status(400).json({ 
          error: 'El período debe ser: week o month' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const metrics = await this.metricsService.getProductMetrics(
        period as 'week' | 'month',
        start,
        end
      )
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas de productos:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Horarios pico
  async getPeakHoursMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query
      
      const targetDate = date ? new Date(date as string) : new Date()

      if (isNaN(targetDate.getTime())) {
        res.status(400).json({ 
          error: 'La fecha debe tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const metrics = await this.metricsService.getPeakHoursMetrics(targetDate)
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas de horarios pico:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Métricas Financieras
  async getFinancialMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { period, startDate, endDate } = req.query
      
      if (!period || !startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: period, startDate, endDate' 
        })
        return
      }

      if (!['day', 'week', 'month'].includes(period as string)) {
        res.status(400).json({ 
          error: 'El período debe ser: day, week, o month' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const metrics = await this.metricsService.getFinancialMetrics(
        period as 'day' | 'week' | 'month',
        start,
        end
      )
      res.json(metrics)
    } catch (error) {
      console.error('Error obteniendo métricas financieras:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Reporte de Ventas
  async getSalesReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query
      
      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: startDate, endDate' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const report = await this.metricsService.getSalesReport(start, end)
      res.json(report)
    } catch (error) {
      console.error('Error obteniendo reporte de ventas:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Reporte por Mesero
  async getWaiterReport(req: Request, res: Response): Promise<void> {
    try {
      const { waiterId, startDate, endDate } = req.query
      
      if (!waiterId || !startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: waiterId, startDate, endDate' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const report = await this.metricsService.getWaiterReport(
        waiterId as string,
        start,
        end
      )
      res.json(report)
    } catch (error) {
      console.error('Error obteniendo reporte del mesero:', error)
      if (error instanceof Error && error.message === 'Mesero no encontrado') {
        res.status(404).json({ error: error.message })
      } else {
        res.status(500).json({ error: 'Error interno del servidor' })
      }
    }
  }

  // Reporte de Productos
  async getProductReport(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query
      
      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'Se requieren los parámetros: startDate, endDate' 
        })
        return
      }

      const start = new Date(startDate as string)
      const end = new Date(endDate as string)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ 
          error: 'Las fechas deben tener formato válido (YYYY-MM-DD)' 
        })
        return
      }

      const report = await this.metricsService.getProductReport(start, end)
      res.json(report)
    } catch (error) {
      console.error('Error obteniendo reporte de productos:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }

  // Invalidar Cache
  async invalidateCache(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query
      
      switch (type) {
        case 'tables':
          await this.metricsService.invalidateTableMetrics()
          break
        case 'realtime':
          await this.metricsService.invalidateRealTimeMetrics()
          break
        case 'sales':
          await this.metricsService.invalidateSalesMetrics()
          break
        case 'waiter':
          await this.metricsService.invalidateWaiterMetrics()
          break
        case 'products':
          await this.metricsService.invalidateProductMetrics()
          break
        case 'peakhours':
          await this.metricsService.invalidatePeakHoursMetrics()
          break
        case 'financial':
          await this.metricsService.invalidateFinancialMetrics()
          break
        case 'all':
          await this.metricsService.invalidateAllMetrics()
          break
        default:
          res.status(400).json({ 
            error: 'Tipo de cache inválido. Tipos válidos: tables, realtime, sales, waiter, products, peakhours, financial, all' 
          })
          return
      }
      
      res.json({ message: `Cache de ${type} invalidado exitosamente` })
    } catch (error) {
      console.error('Error invalidando cache:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
} 