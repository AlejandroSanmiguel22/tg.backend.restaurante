import { Router } from 'express'
import { MetricsController } from '../controllers/MetricsController'
import { MetricsService } from '../../application/services/MetricsService'
import { RedisAdapter } from '../../infrastructure/adapters/RedisAdapter'
import { OrderRepositoryMongo } from '../../infrastructure/repositories/OrderRepositoryMongo'
import { TableRepositoryMongo } from '../../infrastructure/repositories/TableRepositoryMongo'
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo'
import { productRepositoryMongo } from '../../infrastructure/repositories/ProductRepositoryMongo'
import { CategoryRepositoryMongo } from '../../infrastructure/repositories/CategoryRepositoryMongo'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

// Crear instancias de repositorios
const orderRepository = new OrderRepositoryMongo()
const tableRepository = new TableRepositoryMongo()
const waiterRepository = new WaiterRepositoryMongo()
const productRepository = new productRepositoryMongo()
const categoryRepository = new CategoryRepositoryMongo()

// Crear instancia de Redis
const redis = RedisAdapter.getInstance()

// Crear instancia del servicio de métricas
const metricsService = new MetricsService(
  redis,
  orderRepository,
  tableRepository,
  waiterRepository,
  productRepository,
  categoryRepository
)

// Crear instancia del controlador
const metricsController = new MetricsController(metricsService)

// Middleware de autenticación para todas las rutas de métricas
router.use(requireAuth(['admin', 'mesero']))

// Métricas de Mesas
router.get('/tables', metricsController.getTableMetrics.bind(metricsController))

// Métricas en Tiempo Real
router.get('/realtime', metricsController.getRealTimeMetrics.bind(metricsController))

// Métricas de Ventas
router.get('/sales', metricsController.getSalesMetrics.bind(metricsController))

// Rendimiento por Mesero
router.get('/waiters', metricsController.getWaiterPerformance.bind(metricsController))

// Rendimiento de Todos los Meseros
router.get('/all-waiters', metricsController.getAllWaitersPerformance.bind(metricsController))

// Productos más vendidos
router.get('/products', metricsController.getProductMetrics.bind(metricsController))

// Horarios pico
router.get('/peak-hours', metricsController.getPeakHoursMetrics.bind(metricsController))

// Métricas Financieras
router.get('/financial', metricsController.getFinancialMetrics.bind(metricsController))

// Reporte de Ventas
router.get('/report/sales', metricsController.getSalesReport.bind(metricsController))

// Reporte por Mesero
router.get('/report/waiter', metricsController.getWaiterReport.bind(metricsController))

// Reporte de Productos
router.get('/report/products', metricsController.getProductReport.bind(metricsController))

// Producto más vendido
router.get('/most-sold-product', metricsController.getMostSoldProduct.bind(metricsController))

// Producto menos vendido
router.get('/least-sold-product', metricsController.getLeastSoldProduct.bind(metricsController))

// Invalidar cache de métricas (solo para admins)
router.get('/invalidate', requireAuth(['admin']), metricsController.invalidateCache.bind(metricsController))

export default router 