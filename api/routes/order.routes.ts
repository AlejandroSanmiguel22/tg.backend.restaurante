import { Router } from 'express'
import { OrderController } from '../controllers/OrderController'
import { OrderRepositoryMongo } from '../../infrastructure/repositories/OrderRepositoryMongo'
import { TableRepositoryMongo } from '../../infrastructure/repositories/TableRepositoryMongo'
import { productRepositoryMongo } from '../../infrastructure/repositories/ProductRepositoryMongo'
import { WaiterRepositoryMongo } from '../../infrastructure/repositories/WaiterRepositoryMongo'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

const orderRepository = new OrderRepositoryMongo()
const tableRepository = new TableRepositoryMongo()
const productRepository = new productRepositoryMongo()
const waiterRepository = new WaiterRepositoryMongo()

const orderController = new OrderController(
  orderRepository,
  tableRepository,
  productRepository,
  waiterRepository
)

// Crear orden (admin y meseros)
router.post('/', requireAuth(['admin', 'mesero']), orderController.create.bind(orderController))

// Obtener orden por ID (admin y meseros)
router.get('/:id', requireAuth(['admin', 'mesero']), orderController.findById.bind(orderController))

// Obtener órdenes por mesa (admin y meseros)
router.get('/table/:tableId', requireAuth(['admin', 'mesero']), orderController.findByTableId.bind(orderController))

// Obtener orden activa por mesa (admin y meseros)
router.get('/table/:tableId/active', requireAuth(['admin', 'mesero']), orderController.findActiveByTableId.bind(orderController))

// Obtener órdenes por mesero (admin y meseros)
router.get('/waiter/:waiterId', requireAuth(['admin', 'mesero']), orderController.findByWaiterId.bind(orderController))

// Obtener órdenes por estado (admin y meseros)
router.get('/status/:status', requireAuth(['admin', 'mesero']), orderController.findByStatus.bind(orderController))

// Obtener órdenes activas (admin y meseros)
router.get('/active/orders', requireAuth(['admin', 'mesero']), orderController.findActive.bind(orderController))

// Actualizar estado de orden (admin y meseros)
router.put('/:id/status', requireAuth(['admin', 'mesero']), orderController.updateStatus.bind(orderController))

// Agregar productos a orden (admin y meseros)
router.post('/:id/items', requireAuth(['admin', 'mesero']), orderController.addItems.bind(orderController))

// Eliminar producto de orden (admin y meseros)
router.delete('/:id/items/:itemId', requireAuth(['admin', 'mesero']), orderController.removeItem.bind(orderController))

// Actualizar producto en orden (admin y meseros)
router.put('/:id/items/:itemId', requireAuth(['admin', 'mesero']), orderController.updateItem.bind(orderController))

// Cerrar orden (facturar) (admin y meseros)
router.get('/:id/close', requireAuth(['admin', 'mesero']), orderController.closeOrder.bind(orderController))

// Generar factura (admin y meseros)
router.post('/:id/bill', requireAuth(['admin', 'mesero']), orderController.generateBill.bind(orderController))

// Eliminar orden (solo admin)
router.delete('/:id', requireAuth(['admin']), orderController.delete.bind(orderController))

export default router 