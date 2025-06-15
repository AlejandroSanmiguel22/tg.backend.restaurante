import { Router } from 'express'
import { DishController } from '../controllers/DishController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', requireAuth(['admin']), DishController.create)

export default router
