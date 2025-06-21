import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { requireAuth } from '../middlewares/authMiddleware'

const router = Router()

router.post('/login', AuthController.login)
router.get('/profile', requireAuth(['admin', 'mesero']), AuthController.profile)

export default router
