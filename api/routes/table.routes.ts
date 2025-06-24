import { Router } from 'express'
import { TableController } from '../controllers/TableController'
import { TableRepositoryMongo } from '../../infrastructure/repositories/TableRepositoryMongo'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

const tableRepository = new TableRepositoryMongo()
const tableController = new TableController(tableRepository)

// Obtener todas las mesas (admin y meseros)
router.get('/', requireAuth(['admin', 'mesero']), tableController.findAll.bind(tableController))

// Obtener mesa por ID (admin y meseros)
router.get('/:id', requireAuth(['admin', 'mesero']), tableController.findById.bind(tableController))

// Obtener mesa por número (admin y meseros)
router.get('/number/:number', requireAuth(['admin', 'mesero']), tableController.findByNumber.bind(tableController))

// Obtener mesas por estado (admin y meseros)
router.get('/status/:status', requireAuth(['admin', 'mesero']), tableController.findByStatus.bind(tableController))

// Obtener mesas disponibles (admin y meseros)
router.get('/available/tables', requireAuth(['admin', 'mesero']), tableController.getAvailableTables.bind(tableController))

// Obtener mesas ocupadas (admin y meseros)
router.get('/occupied/tables', requireAuth(['admin', 'mesero']), tableController.getOccupiedTables.bind(tableController))

// Actualizar mesa (solo admin)
router.put('/:id', requireAuth(['admin']), tableController.update.bind(tableController))

// Actualizar estado de mesa (admin y meseros)
router.put('/:id/status', requireAuth(['admin', 'mesero']), tableController.updateStatus.bind(tableController))

// Eliminar mesa (solo admin)
router.delete('/:id', requireAuth(['admin']), tableController.delete.bind(tableController))

export default router 