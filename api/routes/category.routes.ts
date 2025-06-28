import { Router } from 'express'
import { CategoryController } from '../controllers/CategoryController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

// Obtener todas las categorías (admin y meseros)
router.get('/', requireAuth(['admin', 'mesero']), CategoryController.findAll)

export default router
